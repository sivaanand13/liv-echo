import { ObjectId } from "mongodb";
import usersController from "./users.js";
import postsController from "./posts.js";
import validation from "../utils/validation.js";
import settings from "../models/settings.js";
import cloudinary from "../cloudinary/cloudinary.js";
import Comment from "../models/comment.js";

// create comment
// each comment is tied to a post

async function createComment(postID, uid, text, attachments){
    
}