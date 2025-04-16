import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import validation from "../utils/validation.js";

export function validateCloudinaryObject(asset) {
  validation.validateObject(asset);
  if (
    typeof asset.public_id !== "string" ||
    typeof asset.url !== "string" ||
    typeof asset.secure_url !== "string" ||
    !["image", "video", "raw"].includes(asset.resource_type)
  ) {
    throw "Invalid Cloudinary asset";
  }
}

export async function uploadMedia(file, folder) {
  const res = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "auto",
  });

  return {
    public_id: res.public_id,
    url: res.url,
    secure_url: res.secure_url,
    resource_type: res.resource_type,
  };
}

export async function uploadBufferedMedia(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, res) => {
        if (err) return reject(err);
        else {
          return resolve({
            public_id: res.public_id,
            url: res.url,
            secure_url: res.secure_url,
            resource_type: res.resource_type,
          });
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export default {
  validateCloudinaryObject,
  uploadBufferedMedia,
};
