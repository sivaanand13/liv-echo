import axios from "../../utils/requests/axios.js";
import validation from "../../utils/validation.js";
import { MESSAGE_LENGTH } from "../../utils/settings.js"; // Assuming settings is available frontend too

async function createPost(text, attachments, isPrivate = false) {
  try {
    // Validate the post text
    text = validation.validateString(text, "Post Text");
    if (text.length > MESSAGE_LENGTH) {
      throw `Post must be less than ${MESSAGE_LENGTH} characters`;
    }

    // If there are attachments, ensure they're valid (optional step)
    let uploaded = [];
    if (attachments && Array.isArray (attachments) && attachments.length > 0) { 
      let w = await axios.uploadAttachments(attachments);//uploadAttachments(attachments);
      console.log("Yeah we just sent " + w.length + " attachments");
      uploaded = w.data;
    }

    // Prepare the post data
    const body = {
      text,
      attachments: uploaded,
      isPrivate,
    };

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

      const response = await axios.post("https://api.cloudinary.com/v1_1/your-cloud-name/image/upload", formData);
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
    console.error('Search error:', err);
    throw err;
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
  deletePost,
  searchPosts
};
