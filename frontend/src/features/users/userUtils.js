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

async function addFriendwithUID(uid) {
  try {
    uid = validation.validateString(uid, "User id");
    const response = await axios.post("users/friends/request", {
      friendUID: uid,
    });
    alert("Friend request sent!");
    return response.data.data;
  } catch (e) {
    alert("Friend request failed! (You may already have a pending request)");
  }
}
async function removeRequest(uid) {
  try {
    uid = validation.validateString(uid, "User id");
    // console.log("Step 2");
    const response = await axios.patch("users/friends/requests/remove", {
      friendUID: uid,
    });
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw ``;
  }
}
export default {
  fetchUsers,
  fetchUserByUID,
  addFriendwithUID,
  removeRequest,
};
