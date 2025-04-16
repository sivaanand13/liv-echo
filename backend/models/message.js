import mongoose, { Schema } from "mongoose";
import settings from "./settings.js";
import { CloudinaryAssetSchema } from "./cloudinaryAsset.js";
const MessageSchema = new Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    senderName: {
      type: String,
    },
    senderUsername: {
      type: String,
    },
    senderProfile: {
      type: String,
    },
    text: {
      type: String,
      trim: true,
      maxlength: settings.MESSAGE_LENGTH,
    },
    attachments: {
      type: [CloudinaryAssetSchema],
      default: [],
    },
    chat: {
      type: mongoose.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
