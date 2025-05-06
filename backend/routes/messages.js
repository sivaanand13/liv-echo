import express, { json } from "express";
import chatsController from "../controllers/chats.js";
import userController from "../controllers/users.js";
import validation from "../utils/validation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import chatValidation from "../utils/chat.validation.js";
import messagesController from "../controllers/messages.js";
import usersController from "../controllers/users.js";
import settings from "../models/settings.js";
import { moderationFunction } from "../utils/text_image_moderation.js";
import { set } from "mongoose";
const router = express.Router();

//middlewares
router.use(authMiddleware);
router.use(uploadMiddleware);

router.route("/:chatId/messages").get(async (req, res) => {
  let chatId = req.params.chatId;
  let chat;
  let uid = req.user.uid;
  try {
    chat = await chatsController.getChatById(chatId);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  try {
    console.log(`User ${req.user.uid} is accessing chat ${chatId}`);

    await chatsController.verifyUserChatAccess(req.user.uid, chatId);
  } catch (e) {
    return res.status(403).json({ message: e });
  }

  try {
    const messages = await messagesController.getMessagesByChatId(uid, chatId);
    return res.status(200).json({
      message: "Fetched chat messages",
      data: messages,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/:chatId/messages").post(async (req, res) => {
  let { chatId, text, attachments, tempId } = req.body;
  let uid = req.user.uid;

  let user;
  let chat;
  try {
    console.log("Validating: ", text, chatId);
    tempId = validation.validateString(tempId);
    user = await usersController.getUserByUID(uid);
    chat = await chatsController.getChatById(chatId);
    text = validation.validateString(text);
    if (text.length > settings.MESSAGE_LENGTH) {
      throw `Message length cannot exceed ${settings.MESSAGE_LENGTH}`;
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Invalid inputs", errors: e });
  }

  try {
    await chatsController.verifyUserChatAccess(uid, chat._id.toString());
  } catch (e) {
    return res.status(403).json({ message: e });
  }

  try {
    const message = await messagesController.postMessage(
      chatId,
      uid,
      text,
      attachments,
      tempId
    );
    return res.status(200).json({
      message: "Attached message media!",
      data: message,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/messages/moderation").post(async (req, res) => {
  console.log("Moderation Route Accessed");
  let { text, attachments } = req.body;

  try {
    const validatedText = validation.validateString(text);
    if (validatedText.length > settings.MESSAGE_LENGTH) {
      return res.status(400).json({
        error: true,
        message: `Message length cannot exceed ${settings.MESSAGE_LENGTH}`,
      });
    }
    validation.validateArray(attachments);

    const moderationResponse = await moderationFunction(text, attachments);

    if (moderationResponse.flagged) {
      return res.status(200).json({
        flagged: moderationResponse.flagged,
        message: `Message got flagged: ${moderationResponse.message}`,
      });
    }
    return res.status(200).json({
      flagged: moderationResponse.flagged,
      message: "Message did not get flagged",
    });
  } catch (e) {
    console.error("Moderation error:", e);
    return res.status(e.status || 500).json({
      error: true,
      message: e.message || "Internal Server Error",
    });
  }
});

router.route("/:chatId/messages/:messageId").put(async (req, res) => {
  let { chatId, messageId } = req.params;
  let attachments = req.files;
  let uid = req.user.uid;

  let message;
  let user;
  let chat;
  try {
    message = await messagesController.getMessageById(messageId);
    user = await usersController.getUserByUID(uid);
    chat = await chatsController.getChatById(chatId);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  try {
    await chatsController.verifyUserChatAccess(uid, message.chat.toString());
    if (message.sender.toString() !== uid) {
      throw `Only original sender can attach items to this message!`;
    }
  } catch (e) {
    return res.status(403).json({ message: e });
  }

  try {
    const message = await messagesController.updateMessageAttachments(
      uid,
      messageId,
      attachments,
      true
    );
    return res.status(200).json({
      message: "Attached message media!",
      data: message,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/:chatId/messages/:messageId").patch(async (req, res) => {
  let { chatId, messageId } = req.params;
  let { text } = req.body;
  let attachments = req.files;
  let uid = req.user.uid;

  let message;
  let user;
  let chat;
  try {
    message = await messagesController.getMessageById(messageId);
    user = await usersController.getUserByUID(uid);
    chat = await chatsController.getChatById(chatId);
    validation.validateArray(attachments);
    chatValidation.validateChatText(text);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  try {
    await chatsController.verifyUserChatAccess(uid, message.chat.toString());
    if (message.sender.toString() !== uid) {
      throw `Only original sender can attach items to this message!`;
    }
  } catch (e) {
    return res.status(403).json({ message: e });
  }

  try {
    let message = await messagesController.updateMessage(
      messageId,
      uid,
      text,
      attachments
    );
    return res.status(200).json({
      message: "Message edited successfully!",
      data: message,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

router.route("/:chatId/messages/:messageId").delete(async (req, res) => {
  let { chatId, messageId } = req.params;
  let uid = req.user.uid;

  let message;
  let chat;
  let user;
  try {
    message = await messagesController.getMessageById(messageId);
    user = await usersController.getUserByUID(uid);
    chat = await chatsController.getChatById(chatId);
    console.log("Trying to delete message: ", messageId);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e });
  }

  try {
    let allowed = await messagesController.hasMessageDeleteAuth(
      chatId,
      messageId,
      uid
    );
    if (allowed == false) {
      throw `Only original sender or admin can delete chat message!`;
    }
  } catch (e) {
    console.log(e);
    return res.status(403).json({ message: e });
  }

  try {
    let message = await messagesController.deleteMessage(uid, messageId);
    return res.status(200).json({
      message: "Message deleted successfully!",
      data: message,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

//get all messages for chatId

export default router;
