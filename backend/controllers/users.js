import validation, { usernamePolicies } from "../utils/validation.js";
import User from "../models/user.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";
import { ObjectId } from "mongodb";
import cloudinary from "../cloudinary/cloudinary.js";
import sharp from "../imageProcessing/sharp.js";
import { chatNamespace } from "../websockets/index.js";
async function validateUnqiueEmail(email) {
  email = validation.validateEmail(email);
  const user = await User.findOne({ email: email });
  return user ? false : true;
}

async function validateUnqiueUsername(username) {
  username = validation.validateUsername(username);
  const user = await User.findOne({ username: username });
  return user ? false : true;
}

async function getUserById(id) {
  console.log(id.toString(), id.toString().length);
  if (typeof id == "string") {
    id = ObjectId.createFromHexString(id);
  }
  const user = User.findOne({ _id: id });
  if (!user) {
    throw `No user with id ${id} exists!`;
  }
  return user;
}

async function getUserByUID(uid, display) {
  if (typeof uid == "object") {
    uid = uid.toString();
  }
  validation.validateString(uid, "User id");
  let user;
  if (display) {
    user = await User.findOne(
      { uid: uid },
      {
        _id: 1,
        name: 1,
        username: 1,
        bio: 1,
        role: 1,
      }
    );
  } else {
    user = await User.findOne({ uid: uid });
  }

  if (!user) {
    throw `No user with uid ${uid} exists!`;
  }
  return user;
}

async function signUpUser(uid, name, email, username, dob) {
  await verifyUserByUID(uid);
  name = validation.validateString(name, "Name");

  email = validation.validateEmail(email);
  await validateUnqiueEmail(email);

  username = validation.validateUsername(username, "Username");
  await validateUnqiueUsername(username);

  validation.validateDob(dob, "Date of Birth");

  const user = await User.create({
    uid,
    name,
    email,
    username,
    dob: new Date(dob),
  });
}
async function editUser(uid, name, email, username, dob, profile, banner) {
  let user = await getUserByUID(uid);
  name = validation.validateString(name, "Name");

  email = validation.validateEmail(email);
  await validateUnqiueEmail(email);

  username = validation.validateUsername(username, "Username");
  await validateUnqiueUsername(username);

  validation.validateDob(dob, "Date of Birth");

  const update = {
    name,
    email,
    username,
    dob: new Date(dob),
  };

  const val = await User.updateOne(
    { uid },
    {
      $set: update,
    }
  );
  user = await getUserByUID(user.uid, false);

  return user;
}

async function updateUser(uid, editObject) {
  let { profile, banner } = editObject;

  let user = await getUserByUID(uid);
  let update = {};

  if (profile) {
    cloudinary.validateCloudinaryObject(profile);
    update.profile = profile;
  }

  if (banner) {
    cloudinary.validateCloudinaryObject(banner);
    update.banner = banner;
  }

  await User.updateOne(
    { uid },
    {
      $set: update,
    }
  );
  user = await getUserByUID(user.uid, false);
  console.log("Edited user", user);
  chatNamespace.to(user.uid).emit("accountUpdated", user);
  return user;
}

async function signInUser(uid, email, username) {
  username = username.trim();
  if (username.length === 0) {
    throw new Error("must enter username");
  }
  email = validation.validateEmail(email);
  await verifyUserByUID(uid);
  await validation.validateUsername(username);
  let user = await User.findOne({ username: username });
  return user;
}

async function searchUsers(query) {
  query = validation.validateString(query, "Search Query");
  query = query.toLowerCase();
  const searchRegex = new RegExp(query, "i");
  return await User.find({
    $or: [
      { name: searchRegex },
      { username: searchRegex },
      { email: searchRegex },
    ],
  }).select("uid name username email profile role");
}

async function uploadFiles(attachments, uid) {
  let media = [];
  if (attachments) {
    validation.validateArray(attachments, "Message attachments");
    for (const attachment of attachments) {
      const { buffer, mimetype } = attachment;
      if (mimetype.startsWith("image/")) {
        const processedImage = await sharp.processChatImage(buffer);
        const cloudinaryAsset = await cloudinary.uploadBufferedMedia(
          processedImage,
          uid
        );
        media.push(cloudinaryAsset);
      } else {
        throw `Only image attachments are allowed in chats!`;
      }
    }
  }
  return media;
}

export default {
  validateUnqiueEmail,
  validateUnqiueUsername,
  signUpUser,
  signInUser,
  getUserById,
  getUserByUID,
  editUser,
  searchUsers,
  uploadFiles,
  updateUser,
};
