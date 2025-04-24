import { get, post } from "../../utils/requests/axios.js";
import firebaseUtils from "../../firebase/utils.js";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import validation from "../../utils/validation.js";
import axios from "../../utils/requests/axios.js";
async function editBanner(banner) {
  let body = {};
  try {
    if (banner) {
      console.log(banner);
      const images = await axios.uploadAttachments(banner);
      console.log(images);
      body.banner = images.data[0];
    }

    console.log("uploaded banner:", body);
    if (Object.keys(body).length > 0) {
      console.log("Trying to edit chat: ", body);
      const response = await axios.patch(`users/editAccount`, body);
      return response.data.data;
    }
  } catch (e) {
    console.log("update chat error: ", e);
    throw `Banner update failed!`;
  }
}
export default {
  editBanner,
};
