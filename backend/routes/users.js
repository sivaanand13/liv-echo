import express, { json } from "express";
import userController from "../controllers/users.js";
import validation from "../utils/validation.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";
import authMiddleware from "../middleware/authMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
const router = express.Router();

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
router.route("/editAccount/").post(async (req, res) => {
  let { uid, name, email, username, dob } = req.body;
  console.log("Trying editAccount for", uid, name, email, username, dob);

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
