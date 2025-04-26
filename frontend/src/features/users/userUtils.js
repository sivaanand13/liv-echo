import axios from "../../utils/requests/axios";
import validation from "../../utils/validation";

async function fetchUsers(query) {
  try {
    const response = await axios.get("users/search", { query: query || ".*" });
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Fetch avaliable chat users failed!`;
  }
}

async function fetchUserByUID(uid) {
  try {
    uid = validation.validateString(uid, "User id");
  } catch (e) {
    console.log(e);
    throw `Invalid user id (${uid})`;
  }
  try {
    const response = await axios.get(`users/profile/${uid}`);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Fetch avaliable chat users failed!`;
  }
}

export default {
  fetchUsers,
  fetchUserByUID,
};
