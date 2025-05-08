import mongoose, { Schema } from "mongoose";
import settings from "./settings.js";
import { CloudinaryAssetSchema } from "./cloudinaryAsset.js";
//import messages from "../controllers/messages.js";
import cloudinary from "../cloudinary/cloudinary.js";
const CommentSchema = new Schema(
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
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
    likes: {
      type: mongoose.Types,ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.pre(
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

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;