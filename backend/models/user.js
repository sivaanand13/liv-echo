import mongoose, { Schema } from "mongoose";
import settings from "./settings.js";
const UserSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
    },
    username: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: settings.USERNAME_LENGTH,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    dob: { type: Date, required: true },
    bio: { type: String, trim: true, maxlength: settings.BIO_LENGTH },
    profileImage: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    settings: {
      notifications: {
        messages: { type: Boolean, default: true },
        posts: { type: Boolean, default: true },
        friendRequests: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
