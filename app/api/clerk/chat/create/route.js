import dbConnect from "../../../../../config/db";
import Chat from "../../../../../models/chat";
import {getAuth} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try{
const {userId} = getAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false,message:"User not authenticated" });
        }

        const chatData={
            userId,
            messages:[],
            name: "New Chat"
        };
        await dbConnect();
        await Chat.create(chatData);
        return NextResponse.json({ success: true, message: "Chat created" });

    }
    catch (error) {
        return NextResponse.json({ success: false, message: "Error creating chat"});
}
    }
