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

const MAX_BIO_LEN = 500;

async function accountInfoModeration(text, attachments) {
  try {
    const response = await axios.post("moderation", {
      text,
      attachments,
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

async function editBanner(banner) {
  let body = {};
  try {
    if (banner) {
      console.log(banner);
      const images = await axios.uploadAttachments(banner);
      console.log(images);
      body.banner = images.data[0];
    }
  } catch (e) {
    console.log("update chat error: ", e);
    throw `Banner update failed!`;
  }

  try {
    console.log(body);
    const urlList = [body?.banner?.url].filter(Boolean);
    const moderationResponse = await accountInfoModeration("", urlList);
    if (moderationResponse.flagged) throw moderationResponse.message;
  } catch (err) {
    console.error("Edit Banner Moderation Error", err);
    throw err;
  }

  try {
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

async function editProfile(profile) {
  let body = {};
  try {
    if (profile) {
      console.log(profile);
      const images = await axios.uploadAttachments(profile);
      console.log(images);
      body.profile = images.data[0];
    }
  } catch (e) {
    console.log("update chat error: ", e);
    throw `Profile update failed!`;
  }

  try {
    const urlList = [body?.profile?.url].filter(Boolean);
    const moderationResponse = await accountInfoModeration("", urlList);
    if (moderationResponse.flagged) throw moderationResponse.message;
  } catch (err) {
    console.error("Edit Profile Moderation Error", err);
    throw err;
  }

  try {
    console.log("uploaded profile:", body);
    if (Object.keys(body).length > 0) {
      console.log("Trying to edit chat: ", body);
      const response = await axios.patch(`users/editAccount`, body);
      return response.data.data;
    }
  } catch (e) {
    console.log("update chat error: ", e);
    throw `Profile update failed!`;
  }
}

function validateBio(bio) {
  bio = validation.validateString(bio, "Bio");
  if (bio.length > MAX_BIO_LEN) {
    throw `User bio cannot be greater than ${MAX_BIO_LEN} characters!`;
  }
  return bio;
}

async function editBio(bio) {
  let body = {};
  try {
    bio = validateBio(bio);
    body.bio = bio;
  } catch (e) {
    console.log("update account error: ", e);
    throw e;
  }

  try {
    const moderationResponse = await accountInfoModeration(body.bio, []);
    if (moderationResponse.flagged) {
      throw moderationResponse.message;
    }
  } catch (err) {
    console.error("Account Info Moderation", err);
    throw err;
  }

  try {
    if (Object.keys(body).length > 0) {
      console.log("Trying to edit bio: ", body);
      const response = await axios.patch(`users/editAccount`, body);
      return response.data.data;
    }
  } catch (e) {
    console.log("update account error: ", e);
    throw e.message || "Update bio failed!";
  }
}

async function resolveFriendRequest(friendUID, type) {
  let body = {};

  try {
    validation.validateNumber(type);
    body.resolution = type;
    body.friendUID = friendUID;
  } catch (e) {
    throw "Friend request resolve failed!";
  }

  try {
    if (Object.keys(body).length > 0) {
      const response = await axios.patch(`users/friends/request`, body);
      return response.data.data;
    }
  } catch (e) {
    console.log("update account error: ", e);
    throw e.message || "Update bio failed!";
  }
}
removeFriend;

async function removeFriend(friendUID) {
  let body = {};

  try {
    body.friendUID = friendUID;
  } catch (e) {
    throw "Friend removal failed!";
  }

  try {
    if (Object.keys(body).length > 0) {
      const response = await axios.patch(`users/friends/requests/remove`, body);
      return response.data.data;
    }
  } catch (e) {
    throw e.message || "Friend removal failed!";
  }
}
export default {
  editBanner,
  editProfile,
  resolveFriendRequest,
  editBio,
  removeFriend,
};
