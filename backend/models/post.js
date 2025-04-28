import mongoose, { Schema } from "mongoose";
import settings from "./settings.js";
import { CloudinaryAssetSchema } from "./cloudinaryAsset.js";
import posts from "../controllers/posts.js";
import cloudinary from "../cloudinary/cloudinary.js";

const PostSchema = new Schema(
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
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // store every user that has liked a post
      }
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment", // this doesn't exist yet but it will
      },
    ],
    /*reporters: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    reportTypes: [
      {
        type: String, 
        enum: settings.REPORT_TYPES, 
        default: "inappropriate",
      }
    ],
    reportNum: {
      type: Number,
    }*/

    reports: {
      reporters: [{ type: Schema.Types.ObjectId, ref: "User" }],
      reportTypes: [{ type: String, enum: settings.REPORT_TYPES, default: "inappropriate", required: true }],
      comments: [{ type: String, required: false }],
      reportNum: {type: Number}

    },
  },
  {
    timestamps: true,
  }
);

PostSchema.pre(
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

const Post = mongoose.model("Post", PostSchema);

export default Post;