import { ObjectId } from "mongodb";
import usersController from "./users.js";
import validation from "../utils/validation.js";
import settings from "../models/settings.js";
import cloudinary from "../cloudinary/cloudinary.js";
import Post from "../models/post.js";

// delete post... make sure an admin can do it no matter what!

// post posts, pretty simple
async function postPost(uid, text, attachments, isPrivate){
    let user = await usersController.getUserByUID(uid);
    validation.validateBoolean(isPrivate);

    text = validation.validateString(text);
    if(text.length > settings.MESSAGE_LENGTH) throw new Error ("text is too long!");

    let newPost = {
        sender: user._id,
        senderName: user.name,
        senderUsername: user.username,
        senderProfile: user.profile,
        text: text,
        attachments: [],
        isPrivate: isPrivate,
        likes: [],
        comments: [],
        reports: {reporters: [], reportTypes: [], comments: [], reportNum: 0},
    };

    if (attachments) {
        for (const attachment of attachments) {
            cloudinary.validateCloudinaryObject(attachment);
            newPost.attachments.push(attachment);
        }
    }

    const post = await Post.create(newPost);
    return post;

}

// check if you can even delete a message to begin with
// probably useful for UI
async function canDeletePost(uid, postID){
    let post = await getPostById(postID.toString());
    let user = await usersController.getUserByUID(uid);

    // if the user is an admin we can ignore these checks
    if(!user.role != "admin" && user._id.toString() != post.sender.toString()){
        console.log("User isn't poster or admin");
        return false;
    }

    console.log("User is admin OR poster!");
    return true;
}

async function deletePost(uid, postID){
    let post = await getPostById(postID.toString());
    let user = await usersController.getUserByUID(uid);

    let canDel = await canDeletePost(uid, postID);
    if(!canDel) throw new Error("You don't have permissions to delete this!");

    await Post.deleteOne({_id: post._id});

}


// there's no "canEditPost" function because you can only edit if you're the poster
async function editPost(uid, postID, text, isPrivate, updateTimestamps){
    let post = await getPostById(postID.toString());
    let user = await usersController.getUserByUID(uid);
    validation.validateBoolean(isPrivate);

    if(post.sender.toString() != user._id.toString()) throw new Error ("You can't delete this post!");

    if (text){
        text = validation.validateString(text);
        if(text.length > settings.MESSAGE_LENGTH) throw new Error ("text is too long!");

        post = await Post.findOneAndUpdate(
            {_id: post.id, sender: user._id},
            {
                $set: {
                    text: text
                }
            },
            { new: true, timestamps: updateTimestamps }
        );
    }

    /*if(attachments){
        validation.validateArray(attachments, "Post attachments");
        
        let media = [];

        for (const attachment of attachments) {
            cloudinary.validateCloudinaryObject(attachment);
            media.push(attachment);
        }

        post = await Post.findOneAndUpdate(
            {_id: post._id, sender: user._id},
            {
                $set: {
                    attachments: media
                }
            },
            { new: true , timestamps: updateTimestamps }
        );
    }*/

        post = await Post.findOneAndUpdate(
            {_id: post.id, sender: user._id},
            {
                $set: {
                    isPrivate: isPrivate
                }
            },
            { new: true, timestamps: updateTimestamps }
        );

    return post;
}

// you can't like a post multiple times or like your own post
async function likePost(uid, postId){
    let post = await getPostById(postID.toString());
    let user = await usersController.getUserByUID(uid);
    
    if(user._id.toString() == post.sender.toString()) throw new Error("you can't like your own post!");

    let likez = post.likes;

    if(likez.includes(user._id)) throw new Error ("you've already liked this post!");
    likez.push(user._id);

    post = await Post.findOneAndUpdate(
        {_id: post._id },
        {
            $set: {
                likes: likez,
            }
        },
        {}
    );

    return post;

}

// report the post
// you can't report your own post or report it multiple times
async function reportPost(uid, postId, reportType, comment){
    let post = await getPostById(postID.toString());
    let user = await usersController.getUserByUID(uid);
    let com = "";
    
    if(user._id.toString() == post.sender.toString()) throw new Error("how did you even manage to report your own post?!");

    reportType = validation.validateString(reportType);
    if(!settings.REPORT_TYPES.includes(reportType)) throw new Error("this report type doesn't exist!");

    let reporterz = post.reports.reporters;
    if(reporterz.includes(user._id)) throw new Error ("You've already reported this post!");

    let reportTypez = post.reports.reportTypes;
    //let reportNum = 0;

    reporterz.push(user._id);
    reportTypez.push(reportType);

    if(comment){
        comment = validation.validateString(comment);
        if(comment.length > settings.MESSAGE_LENGTH) throw new Error ("text is too long!");
        com = comment;
    }

    let commenz = post.reports.comments;
    commenz.push(com);

    let reportN = post.reports.reportNum;
    reportN += 1;

    post = await Post.findOneAndUpdate(
        {_id: post._id },
        {
            $set: {
                reports: {reporters: reporterz, reportTypes: reportTypez, comments: commenz, reportNum: reportN},
            }
        },
        {}
    );

    return post;

}

async function getPostById(postId) {
    
    postId = validation.validateString(postId, "Post Id", true);
    postId = ObjectId.createFromHexString(postId);
    const post = await Post.findById(postId);
    if (!post) {
        throw `No post with id (${post})!`;
    }
    return post;
}

export default {
    postPost,
    canDeletePost,
    deletePost,
    editPost,
    likePost,
    reportPost,
    getPostById,
};