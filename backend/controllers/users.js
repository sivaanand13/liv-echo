import validation, { usernamePolicies } from "../utils/validation.js";
import User from "../models/user.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";
import { ObjectId } from "mongodb";
import cloudinary from "../cloudinary/cloudinary.js";
import sharp from "../imageProcessing/sharp.js";
import { chatNamespace } from "../websockets/index.js";
import settings from "../models/settings.js";
import { sendNotification } from "./notification.js";
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
  const user = User.findOne({ _id: id }).populate(
    "friends",
    "name username email profile uid"
  );
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
        uid: 1,
        name: 1,
        username: 1,
        bio: 1,
        role: 1,
        profile: 1,
        banner: 1,
        friends: 1,
      }
    ).populate("friends", "name username email profile uid");
  } else {
    user = await User.findOne({ uid: uid })
      .populate("friends", "name username email profile banner uid")
      .populate("friendRequests", "name username email profile banner uid");
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

  console.log("Sign Up result", user);
  return user;
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
  console.log("Edited user", user);
  chatNamespace.to(user.uid).emit("accountUpdated", user);
  return user;
}
async function updateUserEmail(uid, newEmail) {
  newEmail = validation.validateEmail(newEmail);

  const user = await getUserByUID(uid);
  if (!user) {
    throw new Error(`No user found with uid ${uid}`);
  }

  const result = await User.updateOne({ uid }, { $set: { email: newEmail } });

  return result;
}
async function updateUser(uid, editObject) {
  let { profile, banner, bio } = editObject;

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

  if (bio) {
    bio = validation.validateString(bio, "Bio");
    if (bio.length > settings.BIO_LENGTH) {
      throw `Bio length must be less than ${settings.BIO_LENGTH}`;
    }
    update.bio = bio;
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
  // if (query === "admin" || query === "livechofficial@gmail.com") {
  //   return [];
  // }
  const searchRegex = new RegExp(query, "i");
  return await User.find({
    $or: [
      { name: searchRegex },
      { username: searchRegex },
      { email: searchRegex },
    ],
    role: { $ne: "admin" },
  }).select("uid name username email profile banner bio role");
}

async function uploadFiles(attachments, uid, unprocessed) {
  let media = [];
  if (attachments) {
    validation.validateArray(attachments, "Message attachments");
    for (const attachment of attachments) {
      const { buffer, mimetype } = attachment;
      if (mimetype.startsWith("image/")) {
        let processedImage;
        if (unprocessed) {
          processedImage = buffer;
        } else {
          processedImage = await sharp.processChatImage(buffer);
        }

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
async function sendFriendRequest(userUid, friendUid) {
  if (userUid === friendUid) throw "You cannot friend yourself.";

  const currUser = await getUserByUID(userUid);
  let friend = await getUserByUID(friendUid);
  const friendId = friend._id;
  if (currUser.friends.some((f) => f._id.toString() == friendId.toString())) {
    throw "You are already friends with this user.";
  }
  console.log("user: ", currUser);
  await User.updateOne(
    { uid: friendUid },
    { $addToSet: { friendRequests: currUser._id } }
  );

  let user = await getUserByUID(userUid, false);
  console.log("Edited user", user);
  chatNamespace.to(user.uid).emit("accountUpdated", user);

  user = await getUserByUID(friendUid, false);
  console.log("Edited user", user);
  chatNamespace.to(user.uid).emit("accountUpdated", user);
  sendNotification(friend._id, friend.uid, "", {
    title: `${user.name} sent you a friend request`,
    body: "",
    type: "friend-request",
    link: `/account`,
  });
  return { message: "Friend Request Sent" };
}

async function removeFriend(userUid, friendUid) {
  if (userUid === friendUid) throw "You cannot friend yourself.";

  let currUser = await getUserByUID(userUid);
  let friend = await getUserByUID(friendUid);
  let friendId = friend._id;
  if (!currUser.friends.some((f) => f._id.toString() == friendId.toString())) {
    throw "You are not friends with this user.";
  }

  await User.updateOne({ uid: userUid }, { $pull: { friends: friend._id } });
  await User.updateOne(
    { uid: friendUid },
    { $pull: { friends: currUser._id } }
  );

  let user = await getUserByUID(userUid, false);
  console.log("Edited user", user);
  chatNamespace.to(user.uid).emit("accountUpdated", user);

  friend = await getUserByUID(friend.uid, false);
  chatNamespace.to(friend.uid).emit("accountUpdated", friend);

  return { message: "Friend removed" };
}

async function resolveFriendRequest(currentUID, frientUID, resolution) {
  let user = await getUserByUID(currentUID);
  let friend = await getUserByUID(frientUID);
  await User.updateOne(
    { _id: user._id },
    {
      $pull: {
        friendRequests: friend._id,
      },
    }
  );
  await User.updateOne(
    { _id: friend._id },
    {
      $pull: {
        friendRequests: user._id,
      },
    }
  );
  if (resolution == 1) {
    await User.updateOne(
      { _id: user._id },
      {
        $addToSet: {
          friends: friend._id,
        },
      }
    );
    await User.updateOne(
      { _id: friend._id },
      {
        $addToSet: {
          friends: user._id,
        },
      }
    );
  }

  user = await getUserByUID(user.uid, false);
  console.log("Edited user", user);
  chatNamespace.to(user.uid).emit("accountUpdated", user);

  sendNotification(friend._id, friend.uid, "", {
    title: `${user.name} accepted your friend request`,
    body: "",
    type: "friend-request",
    link: `/users/${user.uid}`,
  });

  sendNotification(user._id, user.uid, "", {
    title: `You are now friends with ${friend.name}`,
    body: "",
    type: "friend-request",
    link: `/users/${friend.uid}`,
  });

  return user;
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
  sendFriendRequest,
  removeFriend,
  updateUserEmail,
  resolveFriendRequest,
};
