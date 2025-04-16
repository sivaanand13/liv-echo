import axios from "../../utils/requests/axios.js";

async function getMessages(currentChat) {
  try {
    const response = await axios.get(`chats/${currentChat._id}/messages`);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Chat messages fetch failed!`;
  }
}

async function sendMessage(chat, messageText, attachments) {
  try {
    const body = { chatId: chat._id, text: messageText };
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const images = await axios.uploadAttachments(attachments);
      console.log("upload atttachments: ", images);
      body.attachments = images.data;
    }
    console.log("Attempting to send message:", body);
    const response = await axios.post(`chats/${chat._id}/messages`, body);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Group chat create failed!`;
  }
}

export default {
  getMessages,
  sendMessage,
};
