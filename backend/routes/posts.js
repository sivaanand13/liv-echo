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
//console.log("One!");
router.use(authMiddleware);
//console.log("Two!");
router.use(uploadMiddleware);
//console.log("Three!");
// post creation
router.route("/create").post(async (req, res) => {
  console.log("Hey!");
  let { text, attachments, isPrivate } = req.body;
  let uid = req.user.uid;

  let user;
  try {
    console.log("Validating: ", text);
    user = await userController.getUserByUID(uid);
    text = validation.validateString(text);
    if (text.length > settings.MESSAGE_LENGTH) {
      throw "Message length cannot exceed"; //${settings.MESSAGE_LENGTH}`;
    }
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Invalid inputs", error: e });
  }

  try {
    const pos = await postsController.postPost(
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
router.route("/:postID").get(async (req, res) => {
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
      if (uid.toString() == post.sender.toString()
        || poster.friends.includes(uid)
        || user.role == "admin") {
        // they can see the post! Yay!

      } else {
        throw new Error("You can't see this!");
      }
    }
    const pos = await postsController.getPostById(postID);
    return res.status(200).json({
      message: "Got the post!",
      data: pos,
    });
  } catch (e) {
    return res.status(403).json({ message: e});
  }
});


// edit post by ID
// you can ONLY do this if you're the POSTER
router.route("/:postID").patch(async (req, res) => {
  let postID = req.params.postID;
  let uid = req.user.uid;
  let post;
  let user, poster;
  let text = req.body;
  let attachments = req.files;


  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserByUID(post.sender);
    validation.validateString(text);
    validation.validateArray(attachments);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // if you aren't the poster, throw an error
  try {
    if (uid.toString() == post.sender.toString()) {
      
      let pos = await postsController.editPost(uid, postID, text, attachments);
      return res.status(200).json({
        message: "Updated post succesfully!",
        data: pos,
      });
    } else {
      throw new Error("You can't edit this!");
    }
  } catch (e) {
    return res.status(403).json({ message: e });
  }
});


// delete message by ID
// you can only do this if you're the poster or an admin
router.route("/:postID").delete(async (req, res) => {
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

  // checks if you're either an admin or the poster
  // if you aren't, throw an error
  try {
    let candle = await postsController.canDeletePost(uid, postID)
    if (candle) {
      
      let pos = await postsController.deletePost(uid, postID);
      return res.status(200).json({
        message: "Deleted post succesfully!",
        data: pos,
      });
    } else {
      throw new Error("You can't delete this!");
    }
  } catch (e) {
    return res.status(403).json({ message: e });
  }
});

export default router;
