import express, { json } from "express";
import userController from "../controllers/users.js";
import validation from "../utils/validation.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";
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

router.route("/signup/").post(async (req, res) => {
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
router.route('/signin/').post(async (req,res) => {
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
  try{
    const user = await userController.signInUser(uid,email,username);
    return res.status(200).json({
      message: "User Sign In successful",
      data: user,
    });
  }
  catch(e){
    console.log(e);
    return res.status(500).json({
      message: "User sign in failed!",
    });
  }
})

export default router;
