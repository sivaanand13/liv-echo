import express, { json } from "express";
import postsController from "../controllers/posts.js";
import commentsController from "../controllers/comments.js";
import adminController from "../controllers/admin.js";
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
import messages from "../controllers/messages.js";
const router = express.Router();

// middleware
router.use(authMiddleware);
router.use(uploadMiddleware);

// comments is also handled in here

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
  } catch (e) {
    return res.status(500).json({
      message: e,
    });
  }
});
router.route("/mod").get(async (req, res) => {
  try {
    let role = req.user.role;
    const pos = await postsController.getModPosts();
    return res.status(200).json({
      message: "Attached message media!",
      data: pos,
    });
  } catch (e) {
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
router.route("/search").get(async (req, res) => {
  const { query } = req.query;
  let uid = req.user.uid;
  let user = null;
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
    res.status(500).json({ message: "Search failed" });
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
    console.log("Welp, we made it this far?");
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
      console.log("friends: ", poster.friends.map(String));
      console.log("viewer:", user._id);
      if (
        uid.toString() == poster.uid.toString() ||
        poster.friends
          .map((obj) => obj._id.toString())
          .includes(user._id.toString()) ||
        user.role == "admin"
      ) {
        // they can see the post! Yay!
      } else {
        throw new Error("You can't see this!");
      }
    }
    const pos = await postsController.getPostById(postID);
    console.log(pos);
    return res.status(200).json({
      message: "Got the post!",
      data: pos,
    });
  } catch (e) {
    console.log("Fetch post failed");
    console.log(e);
    return res.status(403).json({ message: e });
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
      console.log("Did i do that?", pos);
      return res.status(200).json({
        message: "Updated post succesfully!",
        data: pos,
      });
    } else {
      throw new Error("You can't edit this!");
    }
  } catch (e) {
    console.log(e);
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
    let candle = await postsController.canDeletePost(uid, postID);
    console.log("Hi guys", candle);
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

// like post
router.route("/:postID/like").patch(async (req, res) => {
  let postID = req.params.postID;
  let uid = req.user.uid;
  let post;
  let user, poster;
  //let attachments = req.files;

  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // wow the same checks again
  try {
    if (post.isPrivate) {
      console.log("boo");
      console.log(uid.toString());
      console.log(poster.uid.toString());
      if (
        uid.toString() == poster.uid.toString() ||
        poster.friends
          .map((obj) => obj._id.toString())
          .includes(user._id.toString()) ||
        user.role == "admin"
      ) {
        // they can see the post! Yay!
      } else {
        throw new Error("You can't see this!");
      }
    }
    //console.log("uid", uid)
    //console.log("postID",postID)
    const pos = await postsController.likePost(uid, postID);
    return res.status(200).json({
      message: "Got the post!",
      data: pos,
    });
  } catch (e) {
    return res.status(403).json({ message: e });
  }
});

// report post
router.route("/:postID/report").patch(async (req, res) => {
  let postID = req.params.postID;
  let uid = req.user.uid;
  let post;
  let user, poster;
  let { reportType, comment } = req.body;
  //let attachments = req.files;

  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
    validation.validateString(reportType);
    validation.validateString(comment);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // yeah yeah make sure they can see the post
  try {
    if (post.isPrivate) {
      console.log("boo");
      console.log(uid.toString());
      console.log(poster.uid.toString());
      if (
        uid.toString() == poster.uid.toString() ||
        poster.friends.map((obj) => obj.uid).includes(uid) ||
        user.role == "admin"
      ) {
        // they can see the post! Yay!
      } else {
        throw new Error("You can't see this!");
      }
    }
    console.log(reportType);
    console.log(comment);
    const pos = await postsController.reportPost(
      uid,
      postID,
      reportType,
      comment
    );
    return res.status(200).json({
      message: "Got the post!",
      data: pos,
    });
  } catch (e) {
    return res.status(403).json({ message: e });
  }
});

router.route("/user/:userUid").get(async (req, res) => {
  let userUid = req.params.userUid;
  try {
    let posts = await postsController.getPostsByUid(userUid);
    return res.status(200).json({
      posts,
    });
  } catch (e) {
    res.status(403).json({ message: e });
  }
});
router.route("/user/find/mutualFriend").get(async (req, res) => {
  try {
    let user;
    console.log("Does this have a value?", req.user.uid);
    if (req.user && req.user.uid) {
      user = await userController.getUserByUID(req.user.uid);
    }
    const results = await postsController.findMutualFriend(user);
    res.json({ results });
  } catch (err) {
    console.error("Friend finding query failed:", err);
    console.error(err);
    res.status(500).json({ message: "Friend finding failed" });
  }
});

// comments start... NOW!

// create comment on post
router.route("/:postID/comment").post(async (req, res) => {
  let postID = req.params.postID;
  let { text, attachments } = req.body;
  let uid = req.user.uid;
  let post, user, poster;

  try {
    post = await postsController.getPostById(postID);
    //console.log("Welp, we made it this far!");
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }
  // check if the post is private
  // if it is, check if the user is a friend of the poster, the poster, or an admin
  // if none are the case, they aren't allowed to see this
  try {
    if (post.isPrivate) {
      console.log("boo");
      console.log(uid.toString());
      console.log(poster.uid.toString());
      if (
        uid.toString() == poster.uid.toString() ||
        poster.friends.map((obj) => obj.uid).includes(uid) ||
        user.role == "admin"
      ) {
        // they can see the post! Yay!
      } else {
        throw new Error("You can't see this!");
      }
    }

    const pos = await commentsController.createComment(
      postID,
      uid,
      text,
      attachments
    );
    return res.status(200).json({
      message: "Attached message media!",
      data: pos,
    });
  } catch (e) {
    console.log("huh" + e);
    return res.status(403).json({ message: e });
  }
});

// edit comment on post
// this... could be optimized a lot
router.route("/:postID/:commentID").patch(async (req, res) => {
  let postID = req.params.postID;
  let commentID = req.params.commentID;
  let { text } = req.body;
  let uid = req.user.uid;
  let post, user, comment, poster, commentor;

  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    comment = await commentsController.getCommentById(commentID);
    poster = await userController.getUserById(post.sender);
    commentor = await userController.getUserById(comment.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // there's a lot of checks here actually, so I'll go one-by-one
  try {
    // first, let's make sure the comment is actually tied to the post
    if (!post.comments.includes(commentID)) throw "comment isn't tied to post!";

    // only the commentor can edit this, but we gotta make sure they can see the post to begin with
    // if a public post was privated, someone who made a comment when it was public shouldn't be able to update it
    if (post.isPrivate) {
      console.log("boo");
      console.log(uid.toString());
      console.log(poster.uid.toString());
      if (
        uid.toString() == poster.uid.toString() ||
        poster.friends.map((obj) => obj.uid).includes(uid) ||
        user.role == "admin"
      ) {
        // they can see the post! Yay!
      } else {
        throw new Error("You can't see this!");
      }
    }

    // last, make sure that it's the commmentor editing the comment
    if (commentor.uid.toString() != uid.toString())
      throw "you're not the commentor!";

    const pos = await commentsController.editComment(commentID, uid, text);
    return res.status(200).json({
      message: "Attached message media!",
      data: pos,
    });
  } catch (e) {
    return res.status(403).json({ message: e });
  }
});

// delete comment on post
// pretty similar to edit, you'd be surprised
router.route("/:postID/:commentID").delete(async (req, res) => {
  console.log("Delete Comment Route");
  let postID = req.params.postID;
  let commentID = req.params.commentID;
  let uid = req.user.uid;
  let post, user, poster;
  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // Admin Delete
  try {
    if (req.user.uid === process.env.ADMIN_UID) {
      const response = await adminController.adminDeleteComment(commentID);
      return res.status(200).json({
        message:
          "Comment deleted successfully and removed from post's comments!",
      });
    }
  } catch (err) {
    console.error(`Something went wrong in delete comment route`, err);
    return res.status(500).json({ messages: `Something went wrong!` });
  }

  // there's a lot of checks here actually, so I'll go one-by-one
  try {
    // first, let's make sure the comment is actually tied to the post
    console.log("comments", post.comments);
    if (!post.comments.includes(commentID)) throw "comment isn't tied to post!";

    // we only need to make the first two checks here
    // it just so happens that the poster, commentor, and admins are the only people that can delete a comment
    if (post.isPrivate) {
      console.log("boo");
      console.log(uid.toString());
      console.log(poster.uid.toString());
      if (
        uid.toString() == poster.uid.toString() ||
        poster.friends.map((obj) => obj.uid).includes(uid) ||
        user.role == "admin"
      ) {
      } else {
        throw new Error("You can't see this!");
      }
    }
    console.log("we're here");
    await commentsController.deleteComment(uid, commentID);
    return res.status(200).json({
      message: "Comment deleted successfully and removed from post's comments!",
    });
  } catch (e) {
    return res.status(403).json({ message: e });
  }
});

// like comment
router.route("/:postID/:commentID/like").patch(async (req, res) => {
  let postID = req.params.postID;
  let commentID = req.params.commentID;
  let uid = req.user.uid;
  let post, user, poster;

  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  // there's a lot of checks here actually, so I'll go one-by-one
  try {
    // first, let's make sure the comment is actually tied to the post
    if (!post.comments.includes(commentID)) throw "comment isn't tied to post!";

    // we only need to make the first two checks here
    // it just so happens that the poster, commentor, and admins are the only people that can delete a comment
    if (post.isPrivate) {
      console.log("boo");
      console.log(uid.toString());
      console.log(poster.uid.toString());
      if (
        uid.toString() == poster.uid.toString() ||
        poster.friends.map((obj) => obj.uid).includes(uid) ||
        user.role == "admin"
      ) {
      } else {
        throw new Error("You can't see this!");
      }
    }
    console.log("liking");
    const pos = await commentsController.likeComment(commentID, uid);
    console.log(pos);
    return res.status(200).json({
      message: "Attached message media!",
      data: pos,
    });
  } catch (e) {
    return res.status(403).json({ message: e });
  }
});

// get every comment from a post
router.route("/:postID/comment").get(async (req, res) => {
  let postID = req.params.postID;
  let uid = req.user.uid;
  let post, user, poster;
  try {
    post = await postsController.getPostById(postID);
    user = await userController.getUserByUID(uid);
    poster = await userController.getUserById(post.sender);
  } catch (e) {
    return res.status(400).json({ message: e });
  }

  try {
    // make sure the user can... actually see the post
    if (post.isPrivate) {
      if (
        uid.toString() == poster.uid.toString() ||
        poster.friends
          .map((obj) => obj._id.toString())
          .includes(user._id.toString()) ||
        user.role == "admin"
      ) {
      } else {
        throw new Error("You can't see this!");
      }
    }
    let comments = [];

    comments = await commentsController.getCommentsByPostId(
      post._id.toString()
    );
    /*
    for (let i = 0; i < post.comments.length; i++) {
      let c = post.comments[i];
      console.log("post comment " + c);
      let gotCom = await commentsController.getCommentById(c.toString());
      comments.push(gotCom);
    }*/

    return res.status(200).json({
      message: "Attached message media!",
      data: comments,
    });
  } catch (e) {
    console.log(e);
    return res.status(403).json({ message: e });
  }
});
export default router;
