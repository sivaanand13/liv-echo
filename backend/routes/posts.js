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

// get all posts
router.route("/").get(async (req, res) => {
  try {
    //console.log("Yep");
    const pos = await postsController.getNPosts(10);
    //console.log("OK");
    //console.log(pos.length);
    return res.status(200).json({
      message: "Attached message media!",
      data: pos,
    });
  }catch (e){
    return res.status(500).json({
      message: e,
    });
  }
});

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
      throw `Message length cannot exceed ${settings.MESSAGE_LENGTH}`;
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
      data: pos,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: e,
    });
  }
});
router.route('/search').get(async (req, res) => {
  const { query } = req.query;
  let uid = req.user.uid;
  let user;
  if (!query || query.trim() === "") {
    console.log("What is my query?", query);
    return res.status(400).json({ message: "Missing search query" });
  }
  try {
    if (uid) {
      user = await userController.getUserByUID(uid);
    }
    const results = await postsController.searchPosts(query, user);
    res.json({ results });
  } catch (err) {
    console.error("Elasticsearch query failed:", err);
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
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
    console.log("Welp, we made it this far");
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // check if the post is private
  // if it is, check if the user is a friend of the poster, the poster, or an admin
  // if none are the case, they aren't allowed to see this
  try {
    console.log("yay");
    if (post.isPrivate) {
      console.log("boo");
      console.log(uid.toString());
      console.log(poster.uid.toString());
      if (uid.toString() == poster.uid.toString()
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
  let { text, isPrivate } = req.body;
  //let attachments = req.files;


  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
    validation.validateString(text);
    validation.validateBoolean(isPrivate);
    //validation.validateArray(attachments);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // if you aren't the poster, throw an error
  try {
    if (uid.toString() == poster.uid.toString()) {
      
      let pos = await postsController.editPost(uid, postID, text, isPrivate);
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
  console.log("Let's delete something!");

  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // checks if you're either an admin or the poster
  // if you aren't, throw an error
  try {
    let candle = await postsController.canDeletePost(uid, postID)
    console.log(candle);
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
