import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    messages: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
        timeStamp: { type: Number, required: true },
      },
    ],
    userId: { type: String, required: true }, // ✅ moved inside the object
  },
  { timestamps: true }
);

// ✅ Export the correct model name
const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
export default Chat;
