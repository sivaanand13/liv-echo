import { ObjectId } from "mongodb";
import usersController from "./users.js";
import validation from "../utils/validation.js";
import settings from "../models/settings.js";
import cloudinary from "../cloudinary/cloudinary.js";
import Post from "../models/post.js";
import elasticClient from '../elasticSearch/elasticsearchClient.js';

// delete post... make sure an admin can do it no matter what!

async function getNPosts(n){
    //console.log("1");
    const posts = await Post.find({}).limit(n)
    .populate("sender", "name username email profile uid")
    .lean();
    //console.log("2");
    return posts;
}

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
    await elasticClient.index({
        index: 'posts',
        id: post._id.toString(),
        body: {
          uid,
          text,
          isPrivate,
          senderUsername: user.username,
          senderName: user.name,
          createdAt: new Date().toISOString()
        }
      });
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
    await elasticClient.delete({
        index: 'posts',
        id: post._id.toString()
    });

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
        await elasticClient.update({
            index: 'posts',
            id: post._id.toString(),
            body: {
              doc: {
                text: text,
                isPrivate: isPrivate,
                updatedAt: new Date()
              }
            }
          });
    return post;
}

// you can't like a post multiple times or like your own post
async function likePost(uid, postId){
    let post = await getPostById(postId.toString());
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
    let post = await getPostById(postId.toString());
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
async function searchPosts(queryText) {
    queryText = validation.validateString(queryText, "Search Query");
    if (!queryText || queryText.length < 2) {
        throw new Error("Search query must be at least 2 characters long.");
    }
    //console.log();
    const  body = await elasticClient.search({
      index: 'posts',
      body: {
        query: {
            match: {
                text: queryText
            }
        }
      }
    });
    console.log("Elasticsearch Response:", JSON.stringify(body, null, 2));
    if (body && body.hits && body.hits.hits.length > 0) {
        console.log("Search Results:", body.hits.hits);
        return body.hits.hits.map(hit => ({
          id: hit._id,
          ...hit._source,
        }));
    } else {
        console.log("No results found");
        return [];
    }
  }
//   async function deletePostFromElastic(postId) {
//     try {
//       const response = await elasticClient.delete({
//         index: 'posts', // The index name you're using
//         id: postId, // The ID of the document you want to delete
//       });
  
//       console.log("Document deleted from Elasticsearch:", response);
//     } catch (error) {
//       console.error("Error deleting document from Elasticsearch:", error);
//     }
//   }
//   async function searchPostAndDelete(queryText) {
//     try {
//       const body = await elasticClient.search({
//         index: 'posts', // The index name you're using
//         body: {
//           query: {
//             match: {
//               text: queryText // The search term to find the document
//             }
//           }
//         }
//       });
  
//       // If results are found, delete the document
//       if (body.hits.hits.length > 0) {
//         const postId = body.hits.hits[0]._id; // Get the ID of the first matching document
//         console.log(`Found document ID: ${postId}`);
//         await deletePostFromElastic(postId); // Delete the document
//       } else {
//         console.log('No matching posts found in Elasticsearch');
//       }
//     } catch (error) {
//       console.error('Error during Elasticsearch search:', error);
//     }
//   }
  
//   // Example usage: Search for the document by a part of the text (e.g., "fun")
//   searchPostAndDelete("Testing I like wario"); // Adjust the search query as necessary
// async function testConnection() {
//     try {
//       const response = await elasticClient.ping();
//       console.log('Connected to Elasticsearch:', response);
//     } catch (error) {
//       console.error('Error connecting to Elasticsearch:', error);
//     }
//   }
  
//   testConnection();
export default {
    getNPosts,
    postPost,
    canDeletePost,
    deletePost,
    editPost,
    likePost,
    reportPost,
    getPostById,
    searchPosts
};