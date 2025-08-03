import dbConnect from "@/config/db";
import Chat from "../../../../../models/chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId, promt } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" });
    }

    await dbConnect();

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return NextResponse.json({ success: false, message: "Chat not found" });
    }

    const userMessage = {
      role: "user",
      content: promt,
      timeStamp: Date.now(),
    };
    chat.messages.push(userMessage);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: promt }],
      model: "deepseek-chat",
      store: true,
    });

    const assistantMessage = {
      role: "assistant",
      content: completion.choices[0].message.content,
      timeStamp: Date.now(),
    };
    chat.messages.push(assistantMessage);
    await chat.save();

    return NextResponse.json({ success: true, data: assistantMessage });
  } catch (error) {
    console.error("POST /chat error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" });
  }
}
