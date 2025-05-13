import { CommandStartedEvent, ObjectId } from "mongodb";
import usersController from "./users.js";
import postsController from "./posts.js";
import validation from "../utils/validation.js";
import settings from "../models/settings.js";
import cloudinary from "../cloudinary/cloudinary.js";
import Comment from "../models/comment.js";
import Post from "../models/post.js";
import { sendNotification } from "./notification.js";

// create comment
// each comment is tied to a post

async function createComment(postID, uid, text, attachments) {
  let user = await usersController.getUserByUID(uid);
  let post = await postsController.getPostById(postID);
  let postOwnerInfo = await usersController.getUserById(post.sender);

  text = validation.validateString(text);
  if (text.length > settings.MESSAGE_LENGTH)
    throw new Error("text is too long!");

  let newCom = {
    sender: user._id,
    senderName: user.name,
    senderUsername: user.username,
    senderProfile: user.profile,
    text: text,
    attachments: [],
    post: post._id,
    likes: [],
  };

  if (attachments) {
    for (const attachment of attachments) {
      cloudinary.validateCloudinaryObject(attachment);
      newCom.attachments.push(attachment);
    }
  }

  const res = await Comment.create(newCom);
  const com = await getCommentById(res._id.toString());
  let coms = post.comments;
  coms.push(com._id);
  console.log("new comment id: ", com._id);
  post = await Post.findOneAndUpdate(
    { _id: post._id },
    {
      $addToSet: {
        comments: com._id,
      },
    },
    { returnDocument: "after" }
  );
  await redisUtils.unsetJSON(`posts/${post._id.toString()}`);

  sendNotification(postOwnerInfo._id, postOwnerInfo.uid, "", {
    title: `${user.name} commented on your post`,
    body: "",
    type: "comment",
    link: `/posts/${postID.toString()}`,
  });

  return com;
}

// edit comment
// only the poster can do this!
async function editComment(commID, uid, text) {
  let user = await usersController.getUserByUID(uid);
  let comment = await getCommentById(commID);
  console.log("Do i make it here", comment.sender._id);
  console.log("User is", user);
  if (comment.sender._id.toString() != user._id.toString())
    throw new Error("You can't edit this comment");

  try {
    if (text) {
      text = validation.validateString(text);
      if (text.length > settings.MESSAGE_LENGTH)
        throw new Error("text is too long!");

      comment = await Comment.findOneAndUpdate(
        { _id: comment.id, sender: user._id },
        {
          $set: {
            text: text,
          },
        },
        { new: true, timestamps: true }
      );
    }
    console.log("I made it to end safe and sound!", comment);
  } catch (err) {
    console.error("Failed mid-editComment logic:", err);
    throw err;
  }
  return comment;
}

// delete comment
// poster and admins can do this
async function canDeleteComment(uid, postID) {
  let comm = await getCommentById(postID.toString());
  let user = await usersController.getUserByUID(uid);

  // if the user is an admin we can ignore these checks
  if (
    user.role != "admin" &&
    user._id.toString() != comm.sender._id.toString()
  ) {
    console.log("User isn't poster or admin");
    return false;
  }

  console.log("User is admin OR poster!");
  return true;
}

// the actual deletion
async function deleteComment(uid, commID) {
  console.log("I made it coach", uid);
  console.log("I love comments", commID);
  let comm = await getCommentById(commID.toString());
  console.log("comm", comm);
  let user = await usersController.getUserByUID(uid.toString());
  let post = await postsController.getPostById(comm.post.toString());

  let canDel = await canDeleteComment(uid, commID);
  if (!canDel) throw new Error("You don't have permissions to delete this!");
  console.log("Another test", comm._id);
  await Comment.deleteOne({ _id: comm._id });

  const result = await Post.findOneAndUpdate(
    { _id: post._id },
    {
      $pull: { comments: comm._id },
    },
    { new: true }
  );
  await redisUtils.unsetJSON(`posts/${post._id.toString()}`);

  if (result.comments.includes(commID)) {
    throw "Could not delete comment in post";
  }
}
async function deleteCommentAnyway(uid, commID) {
  let comm = await getCommentById(commID.toString());
  //console.log("comm", comm);
  //console.log("comm.sender", comm.sender)
  let user = await usersController.getUserByUID(comm.sender.uid.toString());
  //console.log("user", user);
  let post = await postsController.getPostById(comm.post.toString());
  //console.log("post", post)
  //console.log("comm.post", comm.post)
  let k = comm._id.toString();
  await Comment.deleteOne({ _id: comm._id });

  let coms = post.comments.filter((comment) => comment.toString() !== k);

  post = await Post.findOneAndUpdate(
    { _id: post._id, sender: user._id },
    {
      $set: {
        comments: coms,
      },
    },
    {}
  );
}

// like comment
async function likeComment(commID, uid) {
  let comm = await getCommentById(commID.toString());
  let user = await usersController.getUserByUID(uid); // User who liked the comment
  let commentOwnerInfo = await usersController.getUserById(comm.sender);
  let licked = false;
  //console.log(comm.sender.toString());
  //console.log(user._id.toString());

  if (user._id.toString() == comm.sender._id.toString()) return licked; //throw new Error("you can't like your own comment!");

  let likez = comm.likes;

  if (likez.includes(user._id)) {
    //console.log(likez);
    likez = likez.filter((lik) => lik.toString() != user._id.toString());
    //console.log(likez);
  } else {
    likez.push(user._id);
    licked = true;
  }
  comm = await Comment.findOneAndUpdate(
    { _id: comm._id },
    {
      $set: {
        likes: likez,
      },
    },
    {}
  );
  await redisUtils.unsetJSON(`posts/${comm.post.toString()}`);

  if (licked)
    sendNotification(commentOwnerInfo._id, commentOwnerInfo.uid, "", {
      title: `${user.name} liked your comment`,
      body: "",
      type: "comment",
      link: `/posts/${comm.post.toString()}`,
    });

  return licked;
}

// get comment by ID
async function getCommentById(commID) {
  commID = validation.validateString(commID, "Comment Id", true);
  commID = ObjectId.createFromHexString(commID);
  const comm = await Comment.findById(commID).populate(
    "sender",
    "name username email profile friends uid"
  );
  if (!comm) {
    console.log("oops");
    throw `No comment with id (${commID})!`;
  }
  return comm;
}

async function getCommentsByPostId(postId) {
  postId = validation.validateString(postId, "Post Id", true);
  postId = ObjectId.createFromHexString(postId);
  const posts = await Comment.find({ post: postId })
    .populate("sender", "name username email profile friends uid")
    .sort({ createdAt: -1 })
    .lean();
  if (!posts) {
    console.log("oops");
    throw `No comments with for post (${postId})!`;
  }
  return posts;
}

export default {
  createComment,
  editComment,
  deleteComment,
  likeComment,
  getCommentById,
  deleteCommentAnyway,
  canDeleteComment,
  getCommentsByPostId,
};
