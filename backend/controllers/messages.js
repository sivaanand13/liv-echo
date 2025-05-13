import { ObjectId } from "mongodb";
import Chat from "../models/chat.js";
import chatValidation from "../utils/chat.validation.js";
import validation from "../utils/validation.js";
import usersController from "./users.js";
import chatsController from "./chats.js";
import Message from "../models/message.js";
import cloudinary from "../cloudinary/cloudinary.js";
import sharp from "../imageProcessing/sharp.js";
import { chatNamespace } from "../websockets/index.js";
import { sendNotification } from "./notification.js";
async function getDisplayMessage(id) {
  return await Message.findById(id).populate(
    "sender",
    "uid name username email profile"
  );
}

async function postMessage(chatId, uid, text, attachments, tempId) {
  const chat = await chatsController.getChatById(chatId);
  const user = await usersController.getUserByUID(uid);

  chatsController.verifyUserChatAccess(uid, chatId);
  text = chatValidation.validateChatText(text);

  // HERE

  let newMessage = {
    sender: user._id,
    senderName: user.name,
    senderProfile: user.profile,
    senderUsername: user.username,
    text: text,
    attachments: [],
    chat: chat._id,
  };

  if (attachments) {
    for (const attachment of attachments) {
      cloudinary.validateCloudinaryObject(attachment);
      newMessage.attachments.push(attachment);
    }
  }

  const message = await Message.create(newMessage);
  await Chat.updateOne(
    { _id: chat._id },
    {
      $set: {
        latestMessage: message._id,
      },
    },
    { new: true }
  );
  console.log("Emitting to new message to all members:", tempId);
  const uiChat = await chatsController.getDisplayChat(chat._id);
  console.log("uiChat", uiChat);
  const displayMessage = await getDisplayMessage(message._id);
  uiChat.members.forEach((member) => {
    chatNamespace.to(member.uid).emit("chatUpdated", uiChat);
    chatNamespace.to(member.uid).emit("messageCreated", displayMessage, tempId);
  });
  for (const memeber of uiChat.members) {
    console.log("Notification Sending System Executed...");
    if (memeber.uid !== uid) {
      if (chat.type === "group") {
        const result = await sendNotification(
          memeber._id,
          memeber.uid,
          chatId,
          {
            type: "new-message",
            title: `Message from ${user.name} in ${chat.name}`,
            body: text.slice(0, 40) + "...",
            link: "/group-chats",
          }
        );
      }
      if (chat.type === "dm") {
        const result = await sendNotification(
          memeber._id,
          memeber.uid,
          chatId,
          {
            type: "new-message",
            title: `Message from ${user.name}`,
            body: text.slice(0, 40) + "...",
            link: "/dms",
          }
        );
      }
    }
  }
}

async function updateMessageAttachments(
  uid,
  messageId,
  attachments,
  updateTimestamps
) {
  const message = await getMessageById(messageId);
  const user = await usersController.getUserByUID(uid);

  chatsController.verifyUserChatAccess(uid, message.chat);

  if (message.sender.toString() !== user._id.toString()) {
    throw `Only original user can attach items to this message!`;
  }

  let media = [];
  if (attachments) {
    validation.validateArray(attachments, "Message attachments");
    for (const attachment of attachments) {
      const { buffer, mimetype } = attachment;
      if (mimetype.startsWith("image/")) {
        const processedImage = await sharp.processChatImage(buffer);
        const cloudinaryAsset = await cloudinary.uploadBufferedMedia(
          processedImage
        );
        media.push(cloudinaryAsset);
      } else {
        throw `Only image attachments are allowed in chats!`;
      }
    }
  }

  validation.validateBoolean(updateTimestamps);

  const updatedMessage = await Message.findOneAndUpdate(
    { _id: message._id, sender: user._id },
    {
      $set: {
        senderName: user.name,
        senderProfile: user.profile,
        attachments: media,
      },
    },
    { new: true, timestamps: updateTimestamps }
  );

  return updatedMessage;
}

async function hasMessageDeleteAuth(chatId, messageId, uid) {
  const chat = await chatsController.getChatById(chatId.toString());
  const message = await getMessageById(messageId.toString());
  const user = await usersController.getUserByUID(uid);
  if (
    !chat.members.find((member) => member.toString() == user._id.toString())
  ) {
    console.log(`User is not member of chat ${chat._id}`);
    return false;
  }

  if (
    chat.admins.find((admin) => admin.toString() == user._id.toString(0)) ||
    message.sender.toString() == user._id.toString()
  ) {
    console.log(`User is admin or user`);
    return true;
  }
}

async function updateMessage(messageId, uid, text, attachments) {
  let message = await getMessageById(messageId);
  const user = await usersController.getUserByUID(uid);

  chatsController.verifyUserChatAccess(uid, message.chat);

  if (message.sender.toString() !== user._id.toString()) {
    throw `Only original user can edit this message!`;
  }

  if (text) {
    text = chatValidation.validateChatText(text);

    message = await Message.findOneAndUpdate(
      { _id: message._id, sender: user._id },
      {
        $set: {
          senderName: user.name,
          senderProfile: user.profile,
          text: text,
        },
      },
      { new: true }
    );
  }

  if (attachments) {
    message = await updateMessageAttachments(uid, messageId, attachments, true);
  }

  return message;
}

async function deleteMessage(uid, messageId) {
  const message = await getMessageById(messageId);
  const user = await usersController.getUserByUID(uid);
  const chat = await chatsController.getDisplayChat(message.chat);
  await chatsController.verifyUserChatAccess(uid, message.chat.toString());

  let allowed = await hasMessageDeleteAuth(message.chat, message._id, uid);
  if (allowed == false) {
    throw `Only original sender or admin can delete chat message!`;
  }

  await Message.deleteOne({ _id: message._id, sender: user._id });

  console.log("Emitting to message delete to all members:");
  chat.members.forEach((member) => {
    console.log("Sending to " + member);
    chatNamespace.to(member.uid).emit("messageRemoved", message);
  });

  if (chat.latestMessage && chat.latestMessage._id.toString() === messageId) {
    const prevMessage = await Message.findOne({ chat: chat._id })
      .sort({ createdAt: -1 })
      .lean();

    await Chat.updateOne(
      { _id: chat._id },
      { $set: { latestMessage: prevMessage ? prevMessage._id : null } }
    );
    const newChat = await chatsController.getDisplayChat(message.chat);
    await chatsController.emitChatUpdated(chat, newChat);
  }
}

async function getMessageById(messageId) {
  messageId = validation.validateString(messageId, "Message Id", true);
  messageId = ObjectId.createFromHexString(messageId);
  const message = await Message.findById(messageId);
  if (!message) {
    throw `No message with id (${message})!`;
  }
  return message;
}

async function getMessagesByChatId(uid, chatId) {
  await chatsController.verifyUserChatAccess(uid, chatId);

  const messages = await Message.find({
    chat: ObjectId.createFromHexString(chatId),
  })
    .sort({ createdAt: 1 })
    .populate("sender", "name username email profile uid")
    .lean();
  return messages;
}
export default {
  postMessage,
  updateMessageAttachments,
  updateMessage,
  getMessageById,
  deleteMessage,
  getMessagesByChatId,
  hasMessageDeleteAuth,
};
