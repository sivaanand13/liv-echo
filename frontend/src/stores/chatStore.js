import { create } from "zustand";

const chatStore = create((set, get) => ({
  directMessageChats: [],
  setDirectMessageChats: (chats) => {
    set({ directMessageChats: chats });
  },
  addDirectMessageChat: (newChat) => {
    set((state) => ({
      directMessageChats: [newChat].concat(state.directMessageChats),
    }));
  },
  updateDirectMessageChat: (updatedChat) => {
    set((state) => ({
      directMessageChats: state.directMessageChats.map((chat) => {
        if (chat._id.toString() === updatedChat._id.toString()) {
          return updatedChat;
        }
        return chat;
      }),
    }));
  },
  removeDirectMessageChat: (newChat) => {
    set((state) => ({
      directMessageChats: state.directMessageChats.filter(
        (chat) => newChat._id.toString() !== chat._id.toString()
      ),
    }));
  },

  groupChats: [],
  setGroupChats: (chats) => {
    set({ groupChats: chats });
  },
  addGroupChat: (newChat) => {
    set((state) => ({
      groupChats: [newChat].concat(state.groupChats),
    }));
  },
  updateGroupChat: (updatedChat) => {
    set((state) => ({
      groupChats: state.groupChats.map((chat) => {
        if (chat._id.toString() === updatedChat._id.toString()) {
          return updatedChat;
        }
        return chat;
      }),
    }));
  },
  removeGroupChat: (newChat) => {
    set((state) => ({
      groupChats: state.groupChats.filter(
        (chat) => newChat._id.toString() !== chat._id.toString()
      ),
    }));
  },

  currentChat: null,
  setCurrentChat: (chat) => {
    console.log("setitng current chat: ", chat);
    set({ currentChat: chat });
  },
  unsetCurrentChat: () => {
    set(() => ({
      currentChat: null,
    }));
  },

  currentChatMessages: [],
  setCurrentMessages: (messages) => {
    set({ currentChatMessages: messages });
  },
  addCurrentChatTempMessages: (message) => {
    const currentChat = get().currentChat;

    if (currentChat && currentChat._id === message.chat.toString()) {
      set((state) => {
        console.log("Temp message: ", message);
        return {
          currentChatMessages: [...state.currentChatMessages, message],
        };
      });
    }
  },
  addCurrentChatMessages: (message, tempId) => {
    const currentChat = get().currentChat;

    if (currentChat && currentChat._id === message.chat.toString()) {
      set((state) => {
        const tempMessage = state.currentChatMessages.find(
          (msg) => msg._id === tempId
        );
        console.log(tempMessage);
        if (tempMessage) {
          return {
            currentChatMessages: state.currentChatMessages.map((msg) => {
              if (msg._id == tempId) {
                return message;
              }
              return msg;
            }),
          };
        }
        return {
          currentChatMessages: [...state.currentChatMessages, message],
        };
      });
    }
  },
  updateCurrentChatMessages: (message) => {
    set((state) => ({
      currentChatMessages: state.currentChatMessages.map((curMessage) => {
        if (message._id.toString() === curMessage._id.toString()) {
          return message;
        }
        return curMessage;
      }),
    }));
  },
  removeCurrentChatMessages: (message) => {
    set((state) => ({
      currentChatMessages: state.currentChatMessages.filter(
        (curMessage) => curMessage._id.toString() !== message._id.toString()
      ),
    }));
  },
}));

export default chatStore;
