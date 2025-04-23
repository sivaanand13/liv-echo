import express, { json } from "express";
import chatsController from "../controllers/chats.js";
import userController from "../controllers/users.js";
import validation, { usernamePolicies } from "../utils/validation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";
import chatValidation from "../utils/chat.validation.js";
import settings from "../models/settings.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import cloudinary, {
  validateCloudinaryObject,
} from "../cloudinary/cloudinary.js";
const router = express.Router();

//middlewares
router.use(authMiddleware);

router.route("/dms/create").post(async (req, res) => {
  let { selectedUser } = req.body;
  let user;
  try {
    selectedUser = await userController.getUserByUID(selectedUser.toString());
    user = await userController.getUserByUID(req.user.uid);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e });
  }

  try {
    let newChat = {
      name: `DM: {${user.uid}|${selectedUser.uid}}`,
      type: "dm",
      members: [selectedUser._id],
    };
    console.log("Attempting to create dm: ", newChat.name);
    const chat = await chatsController.createChat(req.user.uid, newChat);
    return res.status(200).json({
      message: "DM created successfully",
      data: chat,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});
router.route("/group-chats/create").post(uploadMiddleware, async (req, res) => {
  let { name, profile, members } = req.body;
  console.log(
    "Trying create chat with name:",
    name,
    "members:",
    members,
    "admin: ",
    req.user.uid
  );
  let newGroupChat = {};
  try {
    name = chatValidation.validateChatName(name);
    newGroupChat.name = name;

    validation.validateArray(members);
    for (const i in members) {
      const memberUID = members[i];
      members[i] = (await userController.getUserByUID(memberUID))._id;
    }
    newGroupChat.members = members;

    newGroupChat.type = settings.GROUP;

    if (profile) {
      cloudinary.validateCloudinaryObject(profile);
      newGroupChat.profile = profile;
    }
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  try {
    const chat = await chatsController.createChat(req.user.uid, newGroupChat);
    return res.status(200).json({
      message: "Group Chat created successfully",
      data: chat,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/:chatId/leave").patch(async (req, res) => {
  let { chatId } = req.params;
  let userId = req.user.uid;

  let chat;
  let user;
  try {
    chat = await chatsController.getChatById(chatId);
    user = await userController.getUserByUID(userId);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  try {
    await chatsController.verifyUserChatAccess(userId, chatId);
  } catch (e) {
    return req.status(403).json({
      message: e,
    });
  }

  try {
    const chat = await chatsController.leaveChat(userId, chatId);
    return res.status(200).json({
      message: "Left group chat successfully",
      data: chat,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/:chatId/update").patch(uploadMiddleware, async (req, res) => {
  let { name, profile, members } = req.body;
  let { chatId } = req.params;

  let chat;
  let uid = req.user.uid;
  let user;
  let update = {};
  try {
    console.log("Calling verifyUserAdminAccess for", uid);
    await chatsController.verifyUserAdminAccess(uid, chatId);
  } catch (e) {
    console.log(e);
    return res.status(403).json({
      message: "Only admin can modify a chat!",
      error: e,
    });
  }
  try {
    chat = await chatsController.getChatById(chatId);
    user = await userController.getUserByUID(uid);
    if (name) {
      name = chatValidation.validateChatName(name);
      update.name = name;
    }

    if (members) {
      validation.validateArray(members);
      for (const i in members) {
        const memberUID = members[i];
        members[i] = (await userController.getUserByUID(memberUID))._id;
      }
      update.members = members;
    }

    if (profile) {
      cloudinary.validateCloudinaryObject(profile);
      update.profile = profile;
    }
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  try {
    const chat = await chatsController.updateChat(chatId, uid, update);
    return res.status(200).json({
      message: "Group Chat updated successfully",
      data: chat,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/:chatId/delete").delete(async (req, res) => {
  let { chatId } = req.params;
  let userId = req.user.uid;

  let chat;
  let user;
  try {
    chat = await chatsController.getChatById(chatId);
    user = await userController.getUserByUID(userId);
  } catch (e) {
    console.log("delte error:", e);

    return res.status(400).json({ message: e });
  }

  try {
    console.log("Calling verifyUserAdminAccess for", userId);
    await chatsController.verifyUserAdminAccess(userId, chatId);
  } catch (e) {
    return req.status(403).json({
      message: e,
    });
  }

  try {
    await chatsController.deleteChat(userId, chatId);
    return res.status(200).json({
      message: "Chat deleted successfully",
      data: chat,
    });
  } catch (e) {
    console.log("delte error:", e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/:chatId/change-admin").patch(async (req, res) => {
  let { chatId } = req.params;
  let userId = req.user.uid;
  let { adminUID: newAdmin } = req.body;

  let chat;
  let user;
  try {
    chat = await chatsController.getChatById(chatId);
    user = await userController.getUserByUID(userId);
    newAdmin = await userController.getUserByUID(newAdmin);
    try {
      await chatsController.verifyUserChatAccess(newAdmin.uid, chatId);
    } catch (e) {
      console.log(e);
      throw `Input new admin is not part of this chat!`;
    }
  } catch (e) {
    console.log("change admin error:", e);
    return res.status(400).json({ message: e });
  }

  try {
    console.log("Calling verifyUserAdminAccess for", userId);
    await chatsController.verifyUserAdminAccess(userId, chatId);
  } catch (e) {
    return req.status(403).json({
      message: e,
    });
  }

  try {
    await chatsController.changeAdmin(
      chat._id.toString(),
      req.user.uid,
      newAdmin.uid
    );
    return res.status(200).json({
      message: "Admin changed successfully",
      data: chat,
    });
  } catch (e) {
    console.log("change admin error:", e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/").get(async (req, res) => {
  try {
    const chats = await chatsController.getUserChats(req.user.uid);
    return res.status(200).json({
      message: "User's chats fetched successfully!",
      data: chats,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/dmOptions").get(async (req, res) => {
  let { query } = req.query;
  console.log(query);
  try {
    query = validation.validateString(query, "Users Query");
    query = query.toLowerCase();
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e });
  }

  try {
    const chats = await chatsController.getDMOptions(req.user.uid, query);
    return res.status(200).json({
      message: "DM options fetched successfully!",
      data: chats,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/groupChatOptions").get(async (req, res) => {
  let { query } = req.query;
  console.log(query);
  try {
    query = validation.validateString(query, "Users Query");
    query = query.toLowerCase();
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e });
  }

  try {
    const chats = await chatsController.getGroupChatOptions(
      req.user.uid,
      query
    );
    return res.status(200).json({
      message: "Group chat options fetched successfully!",
      data: chats,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/dms").get(async (req, res) => {
  try {
    const chats = await chatsController.getUserDMs(req.user.uid);
    return res.status(200).json({
      message: "User DMs fetched successfully!",
      data: chats,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/group-chats").get(async (req, res) => {
  try {
    const chats = await chatsController.getUserGroupChats(req.user.uid);
    return res.status(200).json({
      message: "User Group Chats fetched successfully!",
      data: chats,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

export default router;
