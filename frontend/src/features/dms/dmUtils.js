import axios from "../../utils/requests/axios.js";

async function getUserDMs() {
  try {
    const response = await axios.get("chats/dms");
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Users fetch failed!`;
  }
}

async function getAvaliableDMUsers(query) {
  try {
    const response = await axios.get("chats/dmOptions", { query });
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Users fetch failed!`;
  }
}

async function createDM(selectedUser) {
  try {
    const response = await axios.post("chats/dms/create", {
      selectedUser,
    });
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Users fetch failed!`;
  }
}

export default {
  getUserDMs,
  getAvaliableDMUsers,
  createDM,
};
