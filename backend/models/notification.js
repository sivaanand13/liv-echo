import mongoose, { Schema } from "mongoose";
import settings from "./settings.js";

const NotificationSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    uid: { type: String, required: true },
    chatId: { type: mongoose.Types.ObjectId, ref: "Chat", default: "" },
    type: {
      type: String,
      enum: [
        "new-message",
        "new-chat",
        "friend-request",
        "new-post",
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
      default: "",
    },
    link: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notifications", NotificationSchema);

export default Notification;
