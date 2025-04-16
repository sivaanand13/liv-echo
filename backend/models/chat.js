import mongoose, { Schema } from "mongoose";
import settings from "./settings.js";
import { CloudinaryAssetSchema } from "./cloudinaryAsset.js";
const ChatSchema = new Schema(
  {
    name: {
      type: String,
      trum: true,
      maxlength: settings.CHAT_NAME_LENGTH,
    },
    type: {
      type: String,
      enum: settings.CHAT_TYPES,
      default: "dm",
    },
    profile: { type: CloudinaryAssetSchema, required: false },
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

ChatSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const chatId = this._id;
    await Message.deleteMany({ chat: chatId });
    next();
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
