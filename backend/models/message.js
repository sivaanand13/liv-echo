import mongoose, { Schema } from "mongoose";
import settings from "./settings.js";
import { CloudinaryAssetSchema } from "./cloudinaryAsset.js";
import messages from "../controllers/messages.js";
import cloudinary from "../cloudinary/cloudinary.js";
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

MessageSchema.pre(
  "deleteMany",
  { document: false, query: true },
  async function () {
    const deleteFilter = this.getFilter();

    const messages = await this.model.find(deleteFilter);
    for (const message of messages) {
      if (message.attachments) {
        for (const image of message.attachments) {
          if (image.public_id) {
            cloudinary.deleteMedia(image).catch((e) => {
              console.log("Error deleting image: ", image);
              console.log(e);
            });
          }
        }
      }
    }
  }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
