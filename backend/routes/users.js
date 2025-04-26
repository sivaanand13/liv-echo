import express, { json } from "express";
import userController from "../controllers/users.js";
import validation from "../utils/validation.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import admin from "firebase-admin";
import cloudinary from "../cloudinary/cloudinary.js";
import settings from "../models/settings.js";
const router = express.Router();

router.route("/").get(authMiddleware, async (req, res) => {
  try {
    const user = await userController.getUserByUID(req.user.uid, false);
    console.log("Fetched user data: ", user);
    return res.status(200).json({
      data: user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "User details fetch failed",
    });
  }
});

router.route("/profile/:userUID").get(authMiddleware, async (req, res) => {
  let { userUID } = req.params;
  let user;
  try {
    user = await userController.getUserByUID(userUID, true);
  } catch (e) {
    return res.status(400).json({
      message: "User profile fetch failed",
      error: e,
    });
  }

  try {
    return res.status(200).json({
      data: user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "User details fetch failed",
    });
  }
});

router.route("/editaccount/email/update").post(async (req, res) => {
  const { uid, newEmail } = req.body;

  if (!uid || !newEmail) {
    return res.status(400).json({
      message: "Missing required parameters (uid, newEmail).",
    });
  }
  try {
    validation.validateEmail(newEmail); // Assuming this will throw if invalid
  } catch (e) {
    return res.status(400).json({
      message: "Invalid email format.",
      errors: e,
    });
  }

  try {
    await admin.auth().updateUser(uid, { email: newEmail });
    res.status(200).json({
      message: "Email successfully updated in Firebase.",
    });

    await userController.updateUserEmail(uid, newEmail);
  } catch (error) {
    console.error("Error updating user email:", error);
    res.status(500).json({
      message: "Failed to update user email.",
      error: error.message,
    });
  }
});
router.route("/editaccount/email/uniqueCheck/").get(async (req, res) => {
  let { email, uid } = req.query;
  console.log("Checking unique email", email);
  try {
    email = validation.validateEmail(email);
  } catch (e) {
    return res.status(400).json({
      message: "Unique email check failed!",
      errors: e,
    });
  }
  try {
    const existingUser = await userController.getUserByUID(uid); //Retrieve the current user by UID
    if (existingUser.email === email) {
      //Email is not changing
      return res.status(200).json({
        message: "Email is available",
      });
    }
    const checkEmail = await userController.validateUnqiueEmail(email);
    if (!checkEmail) {
      return res.status(400).json({
        message: "Email is in use by another user!",
      });
    }
    console.log("Email not taken");
    return res.status(200).json({
      email: checkEmail,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Unique email check failed!",
    });
  }
});
router.route("/editaccount/username/uniqueCheck/").get(async (req, res) => {
  let { username, uid } = req.query;
  console.log("Checking unique username", username);
  try {
    username = validation.validateUsername(username);
  } catch (e) {
    return res.status(400).json({
      message: "Unique username check failed!",
      errors: e,
    });
  }
  try {
    const existingUser = await userController.getUserByUID(uid); //Retrieve the current user by UID
    if (existingUser.username === username) {
      //Email is not changing
      return res.status(200).json({
        message: "Username is available",
      });
    }
    const checkUsername = await userController.validateUnqiueUsername(username);
    if (!checkUsername) {
      return res.status(400).json({
        message: "Username is in use by another user!",
      });
    }
    console.log("Username free");
    return res.status(200).json({
      username: checkUsername,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Unique username check failed!",
    });
  }
});

router.route("/signup/uniqueCheck/").get(async (req, res) => {
  let { email, username } = req.query;
  console.log("Checking unique email and username", email, username);
  try {
    email = validation.validateEmail(email);
  } catch (e) {
    return res.status(400).json({
      message: "Unique email check failed!",
      errors: e,
    });
  }

  try {
    username = validation.validateUsername(username);
  } catch (e) {
    return res.status(400).json({
      message: "Unique username check failed!",
      errors: e,
    });
  }
  try {
    const checkEmail = await userController.validateUnqiueEmail(email);
    if (!checkEmail) {
      return res.status(400).json({
        message: "Email is in use by another user!",
      });
    }
    const checkUsername = await userController.validateUnqiueUsername(username);
    if (!checkUsername) {
      return res.status(400).json({
        message: "Username is in use by another user!",
      });
    }
    console.log("Email and password are not taken");
    return res.status(200).json({
      username: checkUsername,
      email: checkEmail,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Unique email check failed!",
    });
  }
});

router.route("/signup").post(async (req, res) => {
  let { uid, name, email, username, dob } = req.body;
  console.log("Trying signup for", uid, name, email, username, dob);

  try {
    await verifyUserByUID(uid);
  } catch (e) {
    return res.status(400).json({
      message: "Invalid firebase Id",
      errors: e,
    });
  }

  try {
    name = validation.validateString(name, "Name");
  } catch (e) {
    return res.status(400).json({
      message: "Invalid name",
      errors: e,
    });
  }

  try {
    email = validation.validateEmail(email);
  } catch (e) {
    return res.status(400).json({
      message: "Invalid email!",
      errors: e,
    });
  }

  try {
    username = validation.validateUsername(username, "Username");
  } catch (e) {
    return res.status(400).json({
      message: "Invalid Username!",
      errors: e,
    });
  }

  try {
    validation.validateDob(dob, "Date of Birth");
  } catch (e) {
    return res.status(400).json({
      message: "Unique date of birth!",
      errors: e,
    });
  }

  try {
    const user = await userController.signUpUser(
      uid,
      name,
      email,
      username,
      dob
    );
    return res.status(200).json({
      message: "User Sign Up successful",
      data: user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "User sign up failed!",
    });
  }
});
router.route("/signin/").post(async (req, res) => {
  let { uid, email, username } = req.body;
  try {
    await verifyUserByUID(uid);
  } catch (e) {
    return res.status(400).json({
      message: "Invalid firebase Id",
      errors: e,
    });
  }
  try {
    username = validation.validateUsername(username, "Username");
  } catch (e) {
    return res.status(400).json({
      message: "Invalid Username!",
      errors: e,
    });
  }
  try {
    email = validation.validateEmail(email);
  } catch (e) {
    return res.status(400).json({
      message: "Invalid email!",
      errors: e,
    });
  }
  try {
    const user = await userController.signInUser(uid, email, username);
    return res.status(200).json({
      message: "User Sign In successful",
      data: user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "User sign in failed!",
    });
  }
});
router.route("/editAccount").patch(authMiddleware, async (req, res) => {
  let { profile, banner, bio } = req.body;
  let user;

  let update = {};
  try {
    user = await userController.getUserByUID(req.user.uid);
    if (profile) {
      cloudinary.validateCloudinaryObject(profile);
      update.profile = profile;
    }
    if (banner) {
      cloudinary.validateCloudinaryObject(banner);
      update.banner = banner;
    }

    if (bio) {
      bio = validation.validateString(bio, "Bio");
      if (bio.length > settings.BIO_LENGTH) {
        throw `Bio length cannot exceed ${settings.BIO_LENGTH}`;
      }
      update.bio = bio;
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      message: "Account update failed",
      error: e,
    });
  }

  try {
    user = await userController.updateUser(req.user.uid, update);
    return res.status(200).json({
      message: "User profile banner updated!",
      user: user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Account update failed",
      error: e,
    });
  }
});
router.route("/editAccount/").post(authMiddleware, async (req, res) => {
  let { name, email, username, dob, profile, banner } = req.body;
  console.log("Trying editAccount for", uid, name, email, username, dob);
  let uid = req.user.uid;

  try {
    name = validation.validateString(name, "Name");
  } catch (e) {
    return res.status(400).json({
      message: "Invalid name",
      errors: e,
    });
  }

  try {
    email = validation.validateEmail(email);
  } catch (e) {
    return res.status(400).json({
      message: "Invalid email!",
      errors: e,
    });
  }

  try {
    username = validation.validateUsername(username, "Username");
  } catch (e) {
    return res.status(400).json({
      message: "Invalid Username!",
      errors: e,
    });
  }

  try {
    validation.validateDob(dob, "Date of Birth");
  } catch (e) {
    return res.status(400).json({
      message: "Unique date of birth!",
      errors: e,
    });
  }

  try {
    console.log("hi");
    const updatedUser = await userController.editUser(
      uid,
      name,
      email,
      username,
      dob
    );
    console.log(updatedUser);
    return res.status(200).json({
      message: "User Account update successful",
      data: updatedUser,
    });
  } catch (e) {
    console.log(e);
    console.log("Why am i here?");
    return res.status(500).json({
      message: "User sign up failed!",
    });
  }
});

router.route("/search").get(authMiddleware, async (req, res) => {
  let { query } = req.query;
  console.log(query);
  try {
    query = validation.validateString(query, "Users Query");
    query = query.toLowerCase();
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: e });
  }

  try {
    const users = await userController.searchUsers(query);
    return res.status(200).json({
      message: "Users search successful",
      data: users,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e });
  }
});

router
  .route("/upload-attachments")
  .post(authMiddleware, uploadMiddleware, async (req, res) => {
    let files = req.files;
    try {
      const cloudinaryAssets = await userController.uploadFiles(
        files,
        req.user.uid
      );
      return res.status(200).json({
        message: "Files upload successfully",
        data: cloudinaryAssets,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: e });
    }
  });

export default router;
