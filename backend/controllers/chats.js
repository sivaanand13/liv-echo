import validation from "../utils/validation.js";
import chatValidation from "../utils/chat.validation.js";
import userController from "./users.js";
import Chat from "../models/chat.js";
import User from "../models/user.js";
import settings from "../models/settings.js";
import { ObjectId } from "mongodb";
import { chatNamespace } from "../websockets/index.js";
import cloudinary from "../cloudinary/cloudinary.js";

async function getDisplayChat(id) {
  const chat = await Chat.findById(id)
    .populate("admins", "uid name username email profile")
    .populate("members", "uid name username email profile")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "uid name username email profile",
      },
    });
  return chat;
}

async function createChat(uid, chat) {
  let { name, type, profile, members, admins } = chat;

  name = chatValidation.validateChatName(name);
  type = chatValidation.validateChatType(type);

  validation.validateArray(members);
  const adminUser = await userController.getUserByUID(uid);

  for (const memberId of members) {
    await userController.getUserById(memberId);
  }

  members.push(adminUser._id);
  members = [...new Set(members)];

  if (type === settings.DM) {
    if (members.length != 2) {
      throw `DM can only have two users`;
    }
    console.log("here");
    if (await getDM(members[0], members[1])) {
      throw `A DM already exists between ${members[0]} and ${members[1]}`;
    }
    admins = [];
  } else {
    admins = [adminUser._id];
  }

  let newChat = {
    name,
    type,
    admins,
    members,
  };
  if (profile) {
    cloudinary.validateCloudinaryObject(profile);
    newChat.profile = profile;
  }
  console.log(newChat);
  newChat = await Chat.create(newChat);

  console.log("Emitting to created chat to all members:");
  const uiChat = await getDisplayChat(newChat._id);
  uiChat.members.forEach((member) => {
    chatNamespace.to(member.uid).emit("chatCreated", uiChat);
  });
  return newChat;
}

async function leaveChat(uid, chatId) {
  const user = await userController.getUserByUID(uid);
  const chat = await getChatById(chatId);

  await verifyUserChatAccess(uid, chatId);

  if (chat.admins.includes(user._id)) {
    throw `Admin cannot leave chat! Edit chat to select new admin before leaving!`;
  }
  await Chat.updateOne(
    { _id: chat._id },
    {
      $pull: { members: user._id },
    }
  );

  console.log("Emitting to updated chat to all members:");
  const uiChat = await getDisplayChat(chat._id);
  // to leaving member the chat is deleted
  chatNamespace
    .to(user.uid.toString())
    .emit("chatRemoved", { _id: chat._id.toString() });
  uiChat.members.forEach((member) => {
    console.log("Emitng chat updated to:", member.uid);
    chatNamespace.to(member.uid).emit("chatUpdated", uiChat);
  });
  return uiChat;
}

async function changeAdmin(chatId, uid, newAdmin) {
  let chat = await getDisplayChat(chatId);
  let user = await userController.getUserByUID(uid);
  await verifyUserAdminAccess(user.uid, chatId);

  console.log("Validating new admin: ", newAdmin);
  newAdmin = await userController.getUserByUID(newAdmin);

  await verifyUserChatAccess(newAdmin.uid, chatId);

  if (user.uid !== newAdmin.uid) {
    let newChat = await Chat.findOneAndUpdate(
      { _id: chat._id },
      {
        $set: {
          admins: [newAdmin._id],
        },
      },
      {
        new: true,
      }
    );
    newChat = await getDisplayChat(newChat._id.toString());
    await emitChatUpdated(chat, newChat);

    return newChat;
  } else {
    return chat;
  }
}

async function updateChat(chatId, uid, options) {
  let chat = await getDisplayChat(chatId);

  await verifyUserAdminAccess(uid, chatId);

  validation.validateObject(options);
  const update = {};
  let { name, members, profile } = options;
  if (name) {
    name = chatValidation.validateChatName(name);
    update.name = name;
  }

  let newChat;
  if (members) {
    validation.validateArray(members);
    members = members.map((m) => m.toString(0));
    const admin = await userController.getUserByUID(uid);
    members.push(admin._id.toString());
    members = [...new Set(members)];

    for (const memberId of members) {
      await userController.getUserById(memberId);
    }
    update.members = members;
  }

  if (profile) {
    cloudinary.validateCloudinaryObject(profile);
    update.profile = profile;
  }

  if (Object.keys(update).length != 0) {
    newChat = await Chat.findOneAndUpdate({ _id: chat._id }, update, {
      new: true,
    });
    newChat = await getDisplayChat(newChat._id.toString());
    await emitChatUpdated(chat, newChat);
  } else {
    return chat;
  }
  return newChat;
}

async function emitChatUpdated(oldChat, newChat) {
  const oldMembers = oldChat.members.map((m) => m.uid);
  const newMembers = newChat.members.map((m) => m.uid);

  for (const member of oldMembers) {
    if (!newMembers.includes(member)) {
      chatNamespace
        .to(member)
        .emit("chatRemoved", { _id: oldChat._id.toString() });
    }
  }

  for (const member of newMembers) {
    if (!oldMembers.includes(member)) {
      chatNamespace.to(member).emit("chatCreated", newChat);
    }
  }

  console.log("Emitting chat chagned to ", newMembers);
  for (const member of newMembers) {
    chatNamespace.to(member).emit("chatUpdated", newChat);
  }
}

async function emitChatRemoved(targetMembers, deletedChat) {
  for (const member of targetMembers) {
    chatNamespace.to(member.uid).emit("chatRemoved", deletedChat);
    console.log("Emitted chat delted to:", member.uid);
  }
}

async function deleteChat(uid, chatId) {
  const user = await userController.getUserByUID(uid);
  const chat = await getDisplayChat(chatId);

  await verifyUserAdminAccess(uid, chatId);

  await Chat.deleteOne({ _id: chat._id });
  console.log("Deleted chat:", chatId);
  await emitChatRemoved(chat.members, { _id: chatId });
  return chat;
}

async function getChatById(id) {
  validation.validateString(id, "Chat Id", true);
  const chat = await Chat.findById(ObjectId.createFromHexString(id));

  if (!chat) {
    throw `No chat with id (${id})!`;
  }

  return chat;
}

async function getDM(uid1, uid2) {
  const dm = await Chat.findOne({
    type: settings.DM,
    members: { $all: [uid1, uid2] },
  });
  return dm;
}

async function verifyUserChatAccess(uid, chatId) {
  const user = await userController.getUserByUID(uid);
  const chat = await getChatById(chatId);
  const memberIds = chat.members.map((id) => id.toString());

  if (!memberIds.includes(user._id.toString())) {
    console.log(
      "Invalid access attempt: " +
        `User (${uid}) does not have access to chat ${chatId}`
    );

    throw `User (${uid}) does not have access to chat ${chatId}`;
  }
  return chat;
}

async function verifyUserAdminAccess(uid, chatId) {
  console.log(`Verifing admin access for chat ${chatId} for user ${chatId}`);
  validation.validateString(uid);
  validation.validateString(chatId);
  const user = await userController.getUserByUID(uid);
  const chat = await getChatById(chatId);

  await verifyUserChatAccess(uid, chatId);
  const adminIds = chat.admins.map((id) => id.toString());
  if (!adminIds.includes(user._id.toString())) {
    throw `User (${uid}) does not have admin access to chat ${chatId}`;
  }
  return chat;
}

async function getUserChats(uid, type) {
  const user = await userController.getUserByUID(uid);

  const chats = await Chat.find({
    members: user._id,
    type: type,
  })
    .sort({ updatedAt: -1 })
    .populate("admins", "uid name username email profile")
    .populate("members", "uid name username email profile")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "uid name username email profile",
      },
    });

  return chats;
}

async function getUserDMs(uid) {
  const chats = await getUserChats(uid, settings.DM);

  return chats;
}

async function getUserGroupChats(uid) {
  const chats = await getUserChats(uid, settings.GROUP);

  return chats;
}

async function getDMOptions(uid, query) {
  console.log("Getting dm options for: ", uid);
  const user = await userController.getUserByUID(uid);
  const currentDms = await getUserDMs(uid);
  const currentDMedUsers = currentDms
    .map((chat) => {
      return chat.members.find(
        (memberId) => memberId.toString() != user._id.toString()
      );
    })
    .filter(Boolean);

  query = validation.validateString(query, "Search Query");
  query = query.toLowerCase();
  const searchRegex = new RegExp(query, "i");
  return await User.find({
    $and: [
      { _id: { $nin: currentDMedUsers.concat(user._id) } },
      {
        $or: [
          { name: searchRegex },
          { username: searchRegex },
          { email: searchRegex },
        ],
      },
    ],
  }).select("uid name username email profile role");
}

async function getGroupChatOptions(uid, query) {
  console.log("Getting group chat options for: ", uid);
  const user = await userController.getUserByUID(uid);

  query = validation.validateString(query, "Search Query");
  query = query.toLowerCase();
  const searchRegex = new RegExp(query, "i");
  return await User.find({
    $and: [
      { _id: { $ne: user._id } },
      {
        $or: [
          { name: searchRegex },
          { username: searchRegex },
          { email: searchRegex },
        ],
      },
    ],
  }).select("uid name username email profile role");
}

export default {
  createChat,
  updateChat,
  getChatById,
  getUserGroupChats,
  getUserDMs,
  getDM,
  getDisplayChat,
  verifyUserAdminAccess,
  verifyUserChatAccess,
  getDMOptions,
  getGroupChatOptions,
  leaveChat,
  deleteChat,
  emitChatUpdated,
  emitChatRemoved,
  changeAdmin,
};
