import express, { json } from "express";
import chatsController from "../controllers/chats.js";
import userController from "../controllers/users.js";
import validation, { usernamePolicies } from "../utils/validation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";
import chatValidation from "../utils/chat.validation.js";
import settings from "../models/settings.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import cloudinary from "../cloudinary/cloudinary.js";
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

router.route("/update").patch(async (req, res) => {
  let { chatId, name, members } = req.body;
  console.log("Trying create chat with name:", name, "members:", members);
  let options = {};
  try {
    let chat = await chatsController.getChatById(chatId);
    const user = await userController.getUserByUID(req.user.uid);

    if (!chat.admins.includes(user.uid)) {
      throw `Only chat admin can modify chat configurations!`;
    }
    if (name) {
      name = chatValidation.validateChatName(name);
      options.name = name;
    }

    if (members) {
      await userController.getUserByUID(req.user.uid);

      validation.validateArray(members, "Members");
      for (const memberId of members) {
        await userController.getUserByUID(memberId);
      }
      options.members = members;
    }
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  try {
    const chat = await chatsController.updateChat(
      chatId,
      req.user.uid,
      options
    );
    return res.status(200).json({
      message: "Chat update successful",
      data: chat,
    });
  } catch (e) {
    console.log(e);
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
