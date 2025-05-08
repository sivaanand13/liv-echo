import { CommandStartedEvent, ObjectId } from "mongodb";
import usersController from "./users.js";
import postsController from "./posts.js";
import validation from "../utils/validation.js";
import settings from "../models/settings.js";
import cloudinary from "../cloudinary/cloudinary.js";
import Comment from "../models/comment.js";

// create comment
// each comment is tied to a post

async function createComment(postID, uid, text, attachments){
    let user = await usersController.getUserByUID(uid);
    let post = await postsController.getPostById(postID);

    text = validation.validateString(text);
    if(text.length > settings.MESSAGE_LENGTH) throw new Error ("text is too long!");

    let newCom = {
        sender: user._id,
        senderName: user.name,
        senderUsername: user.username,
        senderProfile: user.profile,
        text: text,
        attachments: [],
        post: post,
        likes: [],
    };

    if (attachments) {
        for (const attachment of attachments) {
            cloudinary.validateCloudinaryObject(attachment);
            newCom.attachments.push(attachment);
        }
    }

    const com = await Comment.create(newCom);

    return com;
}

// edit comment
// only the poster can do this!
async function editComment(commID, uid, text){
    let user = await usersController.getUserByUID(uid);
    let comment = await getCommentById(commID);

    if(comment.sender.toString() != user._id.toString()) throw new Error ("You can't delete this post!");

    if (text){
        text = validation.validateString(text);
        if(text.length > settings.MESSAGE_LENGTH) throw new Error ("text is too long!");

        comment = await Comment.findOneAndUpdate(
            {_id: comment.id, sender: user._id},
            {
                $set: {
                    text: text
                }
            },
            { new: true, timestamps: updateTimestamps }
        );
    }

    return comment;
}

// delete comment
// poster and admins can do this
async function canDeleteComment(uid, postID){
    let comm = await getCommentById(postID.toString());
    let user = await usersController.getUserByUID(uid);

    // if the user is an admin we can ignore these checks
    if(!user.role != "admin" && user._id.toString() != comm.sender.toString()){
        console.log("User isn't poster or admin");
        return false;
    }

    console.log("User is admin OR poster!");
    return true;
}

// the actual deletion
async function deletePost(uid, commID){
    let comm = await getCommentById(commID.toString());
    let user = await usersController.getUserByUID(uid);

    let canDel = await canDeleteComment(uid, commID);
    if(!canDel) throw new Error("You don't have permissions to delete this!");

    await Comment.deleteOne({_id: comm._id});

}

// like comment


// get comment by ID
async function getCommentById(commID) {
    
    commID = validation.validateString(commID, "Comment Id", true);
    commID = ObjectId.createFromHexString(commID);
    const comm = await Comment.findById(commID);
    if (!comm) {
        throw `No post with id (${comm})!`;
    }
    return comm;
}