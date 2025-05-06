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

async function messageModeration(messageText, attachments) {
  try {
    const response = await axios.post("chats/messages/moderation", {
      text: messageText,
      attachments: attachments,
    });

    if (response.data) {
      return response.data;
    } else {
      throw "No Response!";
    }
  } catch (e) {
    console.error(e);
    throw `Message Moderation Failed`;
  }
}

async function sendMessage(chat, messageText, attachments, sender) {
  const { addCurrentChatTempMessages, removeCurrentChatMessages } =
    chatStore.getState();
  console.log("message sender: ", sender);
  let newMessage;
  const tempId = uuidv4();
  const body = { tempId, chatId: chat._id, text: messageText };
  try {
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const images = await axios.uploadAttachments(attachments);
      console.log("upload atttachments: ", images);
      body.attachments = images.data;
    }
  } catch (e) {
    console.log(e);
    throw `Message validation failed!`;
  }

  try {
    const image_url_list = [];
    if (body.attachments) {
      for (let img_obj of body.attachments) {
        image_url_list.push(img_obj.secure_url);
      }
    }
    const moderationResponse = await messageModeration(
      messageText,
      image_url_list
    );
    if (moderationResponse.flagged) throw moderationResponse.message;
  } catch (e) {
    console.error(e);
    throw e;
  }

  try {
    console.log("Attempting to send message:", body);

    newMessage = {
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
    removeCurrentChatMessages(newMessage);
    console.log(e);
    throw e.message || `Message send failed!`;
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

async function leaveChat(chat) {
  try {
    const response = await axios.patch(`chats/${chat._id}/leave`, {});
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Chat leave failed!`;
  }
}

async function deleteChat(chat) {
  try {
    const response = await axios.del(`chats/${chat._id}/delete`, {});
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Chat leave failed!`;
  }
}

export default {
  getMessages,
  sendMessage,
  deleteMessage,
  leaveChat,
  deleteChat,
  messageModeration,
};
