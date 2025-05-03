import express, { json } from "express";
import postsController from "../controllers/posts.js";
import userController from "../controllers/users.js";
import validation, { usernamePolicies } from "../utils/validation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";
import chatValidation from "../utils/chat.validation.js";
import settings from "../models/settings.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import cloudinary, {
  validateCloudinaryObject,
} from "../cloudinary/cloudinary.js";
const router = express.Router();

// middleware
router.use(authMiddleware);

// post creation
router.route("/posts/create").post(async (req, res) => {
  let { text, attachments, isPrivate } = req.body;
  let uid = req.user.uid;

  let user;
  try {
    console.log("Validating: ", text);
    user = await usersController.getUserByUID(uid);
    text = validation.validateString(text);
    if (text.length > settings.MESSAGE_LENGTH) {
      throw `Message length cannot exceed ${settings.MESSAGE_LENGTH}`;
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Invalid inputs", errors: e });
  }

  try {
    const pos = await postssController.postPost(
      uid,
      text,
      attachments,
      isPrivate
    );
    return res.status(200).json({
      message: "Attached message media!",
      data: message,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});

// post by ID
router.route("posts/:postID").get(async (req, res) => {
  let postID = req.params.postID;
  let uid = req.user.uid;
  let post;
  let user, poster;


  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserByUID(post.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // check if the post is private
  // if it is, check if the user is a friend of the poster, the poster, or an admin
  // if none are the case, they aren't allowed to see this
  try {
    if (post.isPrivate) {
      if (uid.toString() == post.sender.toString
        || poster.friends.includes(uid)
        || user.role == "admin") {
        // they can see the post! Yay!
        
      } else {
        throw new Error("ew!");
      }
    }
    const pos = await postsController.getPostById(postID);
    return res.status(200).json({
      message: "Got the post!",
      data: pos,
    });
  } catch (e) {
    return res.status(403).json({ message: "you can't see this!" });
  }
});

