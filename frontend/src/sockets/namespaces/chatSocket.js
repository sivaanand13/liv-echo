import socketManager from "../socketManager.js";
import chatStore from "../../stores/chatStore.js";
const log = (...vars) => {
  console.log("ChatSocker: ", ...vars);
};
const connect = async () => {
  const socket = await socketManager.connectSocket("chat");

  socket.on("chatCreated", (chat) => {
    log("chatCreated", chat);
    if (chat.type == "dm") {
      chatStore.getState().addDirectMessageChat(chat);
    } else {
      chatStore.getState().addGroupChat(chat);
    }
  });

  socket.on("chatUpdated", (chat) => {
    if (chat.type == "dm") {
      chatStore.getState().updateDirectMessageChat(chat);
    } else {
      chatStore.getState().updateGroupChat(chat);
    }
  });

  socket.on("chatRemoved", (chat) => {
    if (chat.type == "dm") {
      chatStore.getState().removeDirectMessageChat(chat);
    } else {
      chatStore.getState().removeGroupChat(chat);
    }
  });

  socket.on("messageCreated", (message, tempId) => {
    console.log("recived message: ", message, tempId);
    chatStore.getState().addCurrentChatMessages(message, tempId);
  });

  socket.on("messageUpdated", (message) => {
    chatStore.getState().updateCurrentChatMessages(message);
  });

  socket.on("messageRemoved", (message) => {
    console.log("messageRemoved: ", message._id);
    chatStore.getState().removeCurrentChatMessages(message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from chat namespace");
  });
};

const disconnect = async () => {
  socketManager.disconnectSocket("chat");
};

export default {
  connect,
  disconnect,
};
