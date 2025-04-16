import mongoose, { Schema } from "mongoose";
export const CloudinaryAssetSchema = new Schema(
  {
    public_id: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
    resource_type: {
      type: String,
      required: true,
      enum: ["image", "video", "raw"],
    },
  },
  {
    timestamps: true,
  }
);

const CloudinaryAsset = mongoose.model(
  "CloudinaryAsset",
  CloudinaryAssetSchema
);

export default CloudinaryAsset;
