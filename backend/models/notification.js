import mongoose, { mongo, Schema } from "mongoose";
import settings from "./settings.js";

const NotificationSchema = new Schema(
  {
    userId: { typeof: mongoose.Schema.ObjectId, ref: "User", required: true },
    uid: { typeof: String, required: true },
    type: {
      typeof: String,
      enum: [
        "new-message",
        "friend-request",
        "post-liked",
        "comment",
        "system",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notifications", NotificationSchema);

export default Notification;
