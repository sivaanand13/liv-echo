import mongoose, { Schema } from "mongoose";
import settings from "./settings";
import { CloudinaryAssetSchema } from "./cloudinaryAsset";
const MessageSchema = new Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    senderName: {
      type: String,
      required: true,
    },
    senderUsername: {
      type: String,
      required: true,
    },
    senderProfile: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: settings.MESSAGE_LENGTH,
    },
    message: {
      type: String,
      trim: true,
      maxlength: settings.MESSAGE_LENGTH,
    },
    attachemnt: {
      type: CloudinaryAssetSchema,
      default: null,
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
