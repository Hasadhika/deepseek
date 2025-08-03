import dbConnect from "../../../../../config/db";
import Chat from "../../../../../models/chat";

import {getAuth} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try{
        const {userId} = getAuth(req);
        const {chatId}= await req.json();


        if (!userId) {
            return NextResponse.json({ success: false, message: "User not authenticated" });
        }
        // Connect to the database and delete the chat
        await dbConnect();
        await Chat.deleteOne({ _id: chatId, userId });


        return NextResponse.json({ success: true, message: "Chat deleted successfully" });

    }
    catch(error) {
        return NextResponse.json({ success: false, message: "Error renaming chat" });
    }
}