import firebaseUtils from "../firebase/firebaseUtils.js";
import chatsController from "../controllers/chats.js";
import usersController from "../controllers/users.js";
import messagesController from "../controllers/messages.js";

const chatNamespaceHandler = (chatNamespace) => {
  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      socket.user = await firebaseUtils.verifyAuthToken(token);
      next();
    } catch (e) {
      socket.emit("error", { message: e });
    }
  });

  chatNamespace.on("connection", (socket) => {
    const uid = socket.user.uid;
    socket.join(uid);
    console.log(`User connected to chat socket with uid: ${uid}`);

    socket.on("refreshAccount", async () => {
      try {
        let user = await usersController.getUserByUID(uid);
        user = usersController.getUserById(user._id.toString());
        socket.join(chatId);
        chatNamespace.to(uid).emit("accountUpdated", user);
      } catch (e) {
        socket.emit("error", { message: e });
      }
    });

    socket.on("joinChat", async (chatId) => {
      try {
        await chatsController.verifyUserChatAccess(uid, chatId);
        socket.join(chatId);
        chatNamespace
          .to(chatId)
          .emit("serverMessage", `${socket.user.name} has joined the chat!`);
      } catch (e) {
        socket.emit("error", { message: e });
      }
    });

    socket.on("postMessage", async (chatId, message) => {
      try {
        await chatsController.verifyUserChatAccess(uid, chatId);

        const presistedMessage = await messagesController.postMessage(
          chatId,
          uid,
          message.text,
          []
        );

        chatNamespace.to(chatId).emit("messagePosted", presistedMessage);

        // const chatMembers = await chatsController.getChatMembers(chatId);

        // chatMembers.forEach((members) => {
        //   if (members.uid !== uid) {
        //     chatNamespace.to(members.uid).emit("notification", {
        //       title: "New Message",
        //       body: `${socket.user.name} send a message in ${chatId}`,
        //       link: `/chat/${chatId}`,
        //     });
        //   }
        // });
      } catch (e) {
        socket.emit("error", { message: e });
      }
    });

    socket.on("updateAttachments", async (chatId, messageId, attachments) => {
      try {
        await chatsController.verifyUserChatAccess(uid, chatId);
        const updatedMessage =
          await messagesController.updateMessageAttachments(
            messageId,
            attachments
          );
        chatNamespace.to(chatId).emit("attachmentsUpdated", updatedMessage);
      } catch (e) {
        socket.emit("error", { message: e });
      }
    });

    socket.on("editMessage", async (chatId, message) => {
      try {
        await chatsController.verifyUserChatAccess(uid, chatId);
        chatNamespace.to(chatId).emit("messageEdited", message);
      } catch (e) {
        socket.emit("error", { message: e });
      }
    });

    socket.on("deleteMessage", async (chatId, messageId) => {
      try {
        await chatsController.verifyUserChatAccess(uid, chatId);
        await messagesController.deleteMessage(messageId);

        chatNamespace.to(chatId).emit("messageDeleted", messageId);
      } catch (e) {
        socket.emit("error", { message: e });
      }
    });

    socket.on("disconnect", async (chatId) => {
      try {
        await chatsController.verifyUserChatAccess(uid, chatId);

        chatNamespace
          .to(chatId)
          .emit(
            "sysMessage",
            `${socket.user.name} has disconnected from the chat!`
          );
      } catch (e) {
        socket.emit("error", { message: e });
      }
    });
  });
};

export default chatNamespaceHandler;
