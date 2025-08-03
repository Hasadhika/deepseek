import Chat from "../../../../../models/chat";
import {getAuth} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try{
        const {userId} = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }

        const {chatId,name}= await req.json();
        //connect to the database and update the chat name
        await dbConnect();
        await Chat.findOneAndUpdate({ _id: chatId, userId },{name});

        return NextResponse.json({ success: true, message: "Chat renamed successfully" });
    }
    catch(error) {
        return NextResponse.json({ success: false, message: "Error renaming chat" });
    }
}