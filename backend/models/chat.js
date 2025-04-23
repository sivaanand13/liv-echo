import mongoose, { Schema } from "mongoose";
import settings from "./settings.js";
import { CloudinaryAssetSchema } from "./cloudinaryAsset.js";
import Message from "./message.js";
import cloudinary from "../cloudinary/cloudinary.js";
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
  async function () {
    const chatId = this._id;
    const cloudinaryAsset = this.profile;
    if (this.profile) {
      cloudinary.deleteMedia(cloudinaryAsset).catch((e) => {
        console.log("Chat profile delete failed:", cloudinaryAsset);
        console.log(e);
      });
    }
    Message.deleteMany({ chat: chatId }).catch((e) => {
      console.log("Messages delete error for: ", chatId);
      console.log(e);
    });
  }
);

const Chat = mongoose.model("Chat", ChatSchema);

export default Chat;
