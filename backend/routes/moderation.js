import express, { json } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import settings from "../models/settings.js";
import validation from "../utils/validation.js";
import { moderationFunction } from "../utils/text_image_moderation.js";
import chatsController from "../controllers/chats.js";
import userController from "../controllers/users.js";
import xss from "xss";
import messages from "../controllers/messages.js";
import { sendNotification } from "../controllers/notification.js";

const router = express.Router();

//middlewares
router.use(authMiddleware);

router.route("/").post(async (req, res) => {
  console.log("Moderation Route Accessed");
  let { text, attachments } = req.body;

  if (text) {
    text = xss(text.trim());
  }

  try {
    // const validatedText = validation.validateString(text);
    // if (validatedText.length > settings.MESSAGE_LENGTH) {
    //   return res.status(400).json({
    //     error: true,
    //     message: `Message length cannot exceed ${settings.MESSAGE_LENGTH}`,
    //   });
    // }
    validation.validateArray(attachments);

    const moderationResponse = await moderationFunction(text, attachments);
    if (moderationResponse) {
      if (moderationResponse.flagged) {
        return res.status(200).json({
          flagged: moderationResponse.flagged,
          message: `Message got flagged: ${moderationResponse.message}`,
        });
      }
    }
    return res.status(200).json({
      flagged: false,
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

router.route("/:chatId/flag-user").patch(async (req, res) => {
  let { chatId } = req.params;
  let userId = req.body.userId;
  let userUID = req.user.uid;
  let chat;
  let user;
  try {
    chat = await chatsController.getChatById(chatId);
    user = await userController.getUserById(userId);
    try {
      await chatsController.verifyUserChatAccess(userUID, chatId);
    } catch (e) {
      console.log(e);
      throw `User does not have chat access`;
    }
  } catch (e) {
    console.log("Flag User Error:", e);
    return res.status(400).json({ success: false, message: e });
  }
  try {
    const response = await chatsController.updateFlagCount(chatId, userId);
    if (!response.success) {
      throw `Could not update flag count`;
    } else {
      return res.status(200).json({ success: true, data: response.data });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, messages: e });
  }
});

router.route("/:chatId/flag-user").get(async (req, res) => {
  let { chatId } = req.params;
  let userId = req.body.userId;
  let userUID = req.user.uid;
  if (!chatId || !userId || !userUID) {
    console.error(
      `Get Flag User Error: Invalid Input Passed chatId: ${chatId}, userId: ${userId}, userUID: ${userUID}`
    );
    return res
      .status(400)
      .json({ success: false, message: "Invalid Input Passed" });
  }
  try {
    chat = await chatsController.getChatById(chatId);
    user = await userController.getUserById(userId);
    try {
      await chatsController.verifyUserChatAccess(userUID, chatId);
    } catch (e) {
      console.log(e);
      throw `User does not have chat access`;
    }
  } catch (e) {
    console.log("Get Flag User Error:", e);
    return res.status(400).json({ success: false, message: e });
  }
  try {
    const flagCount = await chatsController.getFlagCount(chatId, userId);
    return res.status(200).json({ success: true, data: flagCount.data });
  } catch (err) {
    console.log("Get Flag User Error:", e);
    return res.status(400).json({ success: false, message: e });
  }
});

router.route("/:chatId/check-ban").post(async (req, res) => {
  let { chatId } = req.params;
  let userId = req.body.userId;
  let userUID = req.user.uid;
  console.log(chatId, userId, userUID);
  let chat;
  let user;
  if (!chatId || !userId || !userUID) {
    console.error(
      `Check Ban Error: Invalid Input Passed chatId: ${chatId}, userId: ${userId}, userUID: ${userUID}`
    );
    return res
      .status(400)
      .json({ success: false, message: "Invalid Input Passed" });
  }
  try {
    chat = await chatsController.getChatById(chatId);
    user = await userController.getUserById(userId);
    try {
      await chatsController.verifyUserChatAccess(userUID, chatId);
    } catch (e) {
      console.log(e);
      throw `User does not have chat access`;
    }
  } catch (e) {
    console.log("Check Ban Error:", e);
    return res.status(400).json({ success: false, message: e });
  }
  try {
    const flagCount = await chatsController.getFlagCount(chatId, userId);
    if (flagCount.data === 4) {
      const response = sendNotification(userId, userUID, chatId, {
        type: "system",
        title: "Warning!!!",
        body: "Final Warning: Continued violations will result in a permanent ban. Please adhere to the community guidelines.",
        link: "",
      });
      return res.status(200).json({ success: true, message: "warning" });
    }
    if (flagCount.data >= 5) {
      const response = sendNotification(userId, userUID, chatId, {
        type: "system",
        title: "Banned!",
        body: `You have been banned due to repeated violations of our community guidelines. This action is final`,
        link: "",
      });
      return res.status(200).json({ success: true, message: "banned" });
    }
  } catch (err) {
    console.log("Check Ban Error Error:", e);
    return res.status(400).json({ success: false, message: e });
  }
});

export default router;
