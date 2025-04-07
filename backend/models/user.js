import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
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
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dob: { type: Date, required: true },
  bio: { type: String, trim: true },
  profileImage: { type: String },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
