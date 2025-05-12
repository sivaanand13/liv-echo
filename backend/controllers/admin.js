import { CommandStartedEvent, ObjectId } from "mongodb";
import usersController from "./users.js";
import postsController from "./posts.js";
import commentController from "./comments.js";
import validation from "../utils/validation.js";
import settings from "../models/settings.js";
import cloudinary from "../cloudinary/cloudinary.js";
import Comment from "../models/comment.js";
import Post from "../models/post.js";

const ADMIN_ID = process.env.ADMIN_ID;
const ADMIN_UID = process.env.ADMIN_UID;

async function adminDeleteComment(commID) {
  console.log("commID", commID);
  let comm = await commentController.getCommentById(commID.toString());

  if (!comm) {
    console.error("ADMIN: Comment not found!");
    throw "ADMIN: Comment not found!";
  }

  //   let user = await usersController.getUserByUID(uid.toString());
  let post = await postsController.getPostById(comm.post.toString());

  if (!post) {
    console.error("ADMIN: Post not found");
    throw "ADMIN: Post not found";
  }

  //   let canDel = await comments.canDeleteComment(uid, commID);
  //   if (!canDel) throw new Error("You don't have permissions to delete this!");
  let k = comm._id.toString();
  await Comment.deleteOne({ _id: comm._id });

  //   let coms = post.comments.filter((comment) => comment.toString() !== k);

  const result = await Post.findOneAndUpdate(
    { _id: post._id },
    {
      $pull: { comments: commID },
    },
    { new: true }
  );

  if (result.comments.includes(commID)) {
    throw "Could not delete comment in post";
  }
}

export default {
  adminDeleteComment,
};
