import { Webhook} from "svix";
import dbConnect from "../../../config/db";
import User from "../../../models/User";
import { NextResponse } from "next/server";
export async function POST(req) {
    const wh= new Webhook(process.env.SIGNING_SECRET);
    const headersPayload = await headers();
    const svixHeaders={
        "svix-id": headersPayload.get("svix-id"),
        "svix-signature": headersPayload.get("svix-signature"),
    };
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const {data,type}= wh.verify(body, svixHeaders);
    //Prepare user data to save in database
    const userData = {
        _id: data.id,
        name: `${data.firstName} ${data.lastName}`,
        email: data.emailAddresses[0].email_address,
        image: data.image_url,
    };
    await dbConnect();
    switch (type) {
        case "user.created":
            await User.create(userData);
            break;
        case "user.updated":
            await User.findByIdAndUpdate(data.id, userData);
            break;
        case "user.deleted":
            await User.findByIdAndDelete(data.id);
            break;
        default:
            console.log("Unhandled event type:", type);
    }
    return NextResponse.json({ message: "Event received" })
}
       
