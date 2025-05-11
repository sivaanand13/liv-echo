import axios from "../../utils/requests/axios.js";
import validation from "../../utils/validation.js";
import { MESSAGE_LENGTH } from "../../utils/settings.js"; // Assuming settings is available frontend too

async function postModeration(text, attachments) {
  try {
    const response = await axios.post("moderation", {
      text,
      attachments,
    });

    if (response.data) {
      return response.data;
    } else {
      throw "No Response!";
    }
  } catch (e) {
    console.error(e);
    throw `Post Moderation Failed`;
  }
}

async function createPost(text, attachments, isPrivate = false) {
  try {
    // Validate the post text
    text = validation.validateString(text, "Post Text");
    if (text.length > MESSAGE_LENGTH) {
      throw `Post must be less than ${MESSAGE_LENGTH} characters`;
    }

    // If there are attachments, ensure they're valid (optional step)
    let uploaded = [];
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      let w = await axios.uploadAttachments(attachments); //uploadAttachments(attachments);
      console.log("Yeah we just sent " + w.length + " attachments");
      uploaded = w.data;
    }

    // Prepare the post data
    const body = {
      text,
      attachments: uploaded,
      isPrivate,
    };

    //Post Moderation
    const moderationResponse = await postModeration(
      body.text,
      body.attachments
    );
    if (moderationResponse.flagged) {
      throw moderationResponse.message;
    }

    // Send the post request
    const response = await axios.post("posts/create", body);
    return response.data.data;
  } catch (err) {
    console.error("Post creation failed", err);
    throw err;
  }
}

// Function to upload attachments (if needed)
async function uploadAttachments(attachments) {
  try {
    // This function should handle the file upload logic (e.g., using axios to upload to Cloudinary)
    const uploadedFiles = [];
    //console.log("EH!");
    for (const attachment of attachments) {
      //console.log("HEY!");
      const formData = new FormData();
      formData.append("file", attachment);
      formData.append("upload_preset", "your-upload-preset"); // Add your Cloudinary upload preset here

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/your-cloud-name/image/upload",
        formData
      );
      uploadedFiles.push(response.data.secure_url);
    }

    return uploadedFiles;
  } catch (error) {
    console.error("Error uploading attachments", error);
    throw new Error("Attachment upload failed" + JSON.stringify(error));
  }
}
async function searchPosts(query) {
  try {
    query = validation.validateString(query, "Search Text");
    console.log("Sending query:", query);
    const response = await axios.get("posts/search", {
      query,
    });
    return response.data.results;
  } catch (err) {
    console.error("Search error:", err);
    throw err;
  }
}
async function getPostByPostId(postId) {
  try {
    const res = await axios.get(`posts/${postId}`);
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch post by ID:", err);
    throw err.response?.data?.message || "Error fetching post.";
  }
}

async function likePostByPostId (postId) {
  try {
    const res = await axios.patch(`posts/${postId}/like`);
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch post by ID:", err);
    throw err.response?.data?.message || "Error fetching post.";
  }
}

async function getPosts() {
  try {
    const response = await axios.get(`posts`);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Post fetch failed!`;
  }
}

async function getComments(postID){
    try {
    const response = await axios.get(`posts/${postID}/comment`);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Comment fetch failed!`;
  }
}

async function deleteComment(postID, commID){
  try {
    const response = await axios.delete(`posts/${postID}/${commID}`);
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Comment fetch failed!`;
  }
}

async function likeCommentByID (postID, commID) {
  try {
    const res = await axios.patch(`posts/${postID}/${commID}/like`);
    return res.data.data;
  } catch (err) {
    console.error("Failed to fetch post by ID:", err);
    throw err.response?.data?.message || "Error fetching post.";
  }
}

async function getPostsByUID(userUid) {
  try {
    const response = await axios.get(`posts/user/${userUid}`);
    console.log(response.data.posts);
    return response.data.posts;
  } catch (e) {
    console.log(e);
    throw `Post fetch failed!`;
  }
}
async function getMutualFriends() {
  try {
    const response = await axios.get(`posts/user/find/mutualFriend`);
    console.log(response.data.results)
    return response.data.results;
  } catch (e) {
    console.log(e);
    throw `Post fetch failed!`;
  }
}
async function deletePost(pos) {
  try {
    const response = await axios.del(`posts/${pos._id}`, {});
    console.log("Well, I tried!");
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw `Post fetch failed!`;
  }
}

export default {
  createPost,
  getPosts,
  getComments,
  deleteComment,
  likeCommentByID,
  deletePost,
  searchPosts,
  getPostsByUID,
  getPostByPostId,
  getMutualFriends
};
