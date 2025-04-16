import sharp from "sharp";

export async function processProfileImage(buffer) {
  return await sharp(buffer).resize(200, 200).jpeg({ quality: 75 }).toBuffer();
}

export async function processChatImage(buffer) {
  return await sharp(buffer)
    .resize({ width: 512 })
    .jpeg({ quality: 80 })
    .toBuffer();
}

export default {
  processChatImage,
  processProfileImage,
};
