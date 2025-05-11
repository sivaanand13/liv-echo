import axios from "../../utils/requests/axios.js";
import validation from "../../utils/validation.js";

const CHAT_NAME_LENGTH = 75;

async function groupInfoModeration(messageText, attachments) {
  try {
    const response = await axios.post("moderation", {
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
  let body = {};
  try {
    body.name = curName;
    body.members = curMembers;
    if (curProfile) {
      const images = await axios.uploadAttachments(curProfile);
      console.log("upload porfile: ", images);
      body.profile = images.data[0];
    }
  } catch (e) {
    console.log(e);
    throw `Group chat create failed!`;
  }

  try {
    const image_url_list = [];
    if (body.profile) {
      image_url_list.push(body.profile.secure_url);
    }
    const moderationResponse = await groupInfoModeration(
      body.name,
      image_url_list
    );
    if (moderationResponse.flagged) {
      throw moderationResponse.message;
    }
  } catch (e) {
    console.error(e);
    throw `Groupchat Error: ${e}`;
  }

  try {
    console.log("Trying to create chat: ", body);
    const response = await axios.post("chats/group-chats/create", body);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Group chat create failed!`;
  }
}

async function editGroupChat(curChat, name, profile, members) {
  try {
    console.log("validationg for edit chat", name, members);
    const body = {};
    if (name) {
      if (name && curChat.name !== name) {
        body.name = name;
        console.log("setting edit name:", body.name);
      }
    }
    if (profile) {
      const images = await axios.uploadAttachments(profile);
      console.log("upload porfile: ", images);
      body.profile = images.data[0];
    }
    if (members) {
      const membersList = curChat.members.map((m) => m.uid).sort();
      if (JSON.stringify(membersList) !== JSON.stringify(members.sort())) {
        body.members = members;
        console.log("setting edit name:", body.members);
      }
    }

    try {
      const image_url_list = [];
      if (body.profile) {
        image_url_list.push(body.profile.secure_url);
      }
      const moderationResponse = await groupInfoModeration(
        body.name,
        image_url_list
      );
      if (moderationResponse.flagged) {
        throw moderationResponse.message;
      }
    } catch (e) {
      console.error("Moderation Error:", e);
      const err = new Error(`Moderation Error: ${e}`);
      err.type = "moderation";
      err.original = e;
      throw err;
    }

    console.log(body);
    if (Object.keys(body).length > 0) {
      console.log("Trying to edit chat: ", body);
      const response = await axios.patch(`chats/${curChat._id}/update`, body);
      return response.data.data;
    }
  } catch (e) {
    if (e.type === "moderation") throw e.message;
    console.log("update chat error: ", JSON.stringify(e));
    throw `Group chat update failed!`;
  }
}

async function changeAdmin(curChat, selectedAdmin) {
  try {
    validation.validateString(selectedAdmin);

    const body = { adminUID: selectedAdmin };

    console.log("Trying to change chat admin: ", body);
    const response = await axios.patch(
      `chats/${curChat._id}/change-admin`,
      body
    );
  } catch (e) {
    console.log("change admin error: ", e);
    throw `Group chat admin change failed!`;
  }
}

export default {
  getUserGroupChats,
  getAvaliableUsers,
  createGroupChat,
  validateChatName,
  validateMembers,
  editGroupChat,
  changeAdmin,
};
