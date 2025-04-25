import axios from "../../utils/requests/axios";

async function fetchUsers(query) {
  try {
    const response = await axios.get("users/search", { query: query || ".*" });
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Fetch avaliable chat users failed!`;
  }
}

export default {
  fetchUsers,
};
