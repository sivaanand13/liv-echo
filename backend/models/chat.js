import mongoose, { Schema } from "mongoose";
import settings from "./settings";
const ChatSchema = new Schema(
  {
    name: {
      type: String,
      trum: true,
      maxlength: settings.CHAT_NAME_LENGTH,
    },
    type: {
      type: String,
      enum: ["dm", "group"],
      default: "dm",
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
