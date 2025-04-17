import chatStore from "../../stores/chatStore.js";
import axios from "../../utils/requests/axios.js";
import { v4 as uuidv4 } from "uuid";

async function getMessages(currentChat) {
  try {
    const response = await axios.get(`chats/${currentChat._id}/messages`);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Chat messages fetch failed!`;
  }
}

async function sendMessage(chat, messageText, attachments, sender) {
  const { addCurrentChatTempMessages } = chatStore.getState();
  console.log("message sender: ", sender);
  try {
    const tempId = uuidv4();
    const body = { tempId, chatId: chat._id, text: messageText };
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const images = await axios.uploadAttachments(attachments);
      console.log("upload atttachments: ", images);
      body.attachments = images.data;
    }
    console.log("Attempting to send message:", body);

    let newMessage = {
      _id: tempId,
      sender: {
        _id: sender._id,
        name: sender.name,
        username: sender.username,
        profile: null,
      },
      senderName: sender.name,
      senderProfile: null,
      senderUsername: sender.username,
      text: messageText,
      attachments: [],
      chat: chat._id,
      createdAt: new Date(),
    };
    addCurrentChatTempMessages(newMessage);
    const response = await axios.post(`chats/${chat._id}/messages`, body);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Message send failed!`;
  }
}

async function deleteMessage(msg) {
  console.log("Attempting to delte message: ", msg._id, "chat", msg.chat);
  try {
    const response = await axios.del(
      `chats/${msg.chat}/messages/${msg._id}`,
      {}
    );
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Message delte failed!`;
  }
}

export default {
  getMessages,
  sendMessage,
  deleteMessage,
};
