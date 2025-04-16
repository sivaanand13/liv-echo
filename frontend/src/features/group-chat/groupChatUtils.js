import axios from "../../utils/requests/axios.js";
import validation from "../../utils/validation.js";

const CHAT_NAME_LENGTH = 75;

function validateChatName(name) {
  name = validation.validateString(name, "Chat Name");
  if (name.length > CHAT_NAME_LENGTH) {
    throw `Chat name length must be less than ${CHAT_NAME_LENGTH} characters`;
  }
  return name;
}

function validateMembers(members) {
  validation.validateArray(members, "Members");
  for (const member of members) {
    validation.validateString(member);
  }
  return members;
}

async function getUserGroupChats() {
  try {
    const response = await axios.get("chats/group-chats");
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `User group chats fetch failed!`;
  }
}

async function getAvaliableUsers() {
  try {
    const response = await axios.get("chats/groupChatOptions", { query: ".*" });
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Fetch avaliable chat users failed!`;
  }
}

async function createGroupChat(curName, curProfile, curMembers) {
  try {
    const body = { name: curName, members: curMembers };
    if (curProfile) {
      const images = await axios.uploadAttachments(curProfile);
      console.log("upload porfile: ", images);
      body.profile = images.data[0];
    }
    console.log("Trying to create chat: ", body);
    const response = await axios.post("chats/group-chats/create", body);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Group chat create failed!`;
  }
}

export default {
  getUserGroupChats,
  getAvaliableUsers,
  createGroupChat,
  validateChatName,
  validateMembers,
};
