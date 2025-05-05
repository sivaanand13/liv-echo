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
    if (attachments && attachments.length > 0) { 
      uploaded = await uploadAttachments(attachments);
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

    for (const attachment of attachments) {
      const formData = new FormData();
      formData.append("file", attachment);
      formData.append("upload_preset", "your-upload-preset"); // Add your Cloudinary upload preset here

      const response = await axios.post("https://api.cloudinary.com/v1_1/your-cloud-name/image/upload", formData);
      uploadedFiles.push(response.data.secure_url);
    }

    return uploadedFiles;
  } catch (error) {
    console.error("Error uploading attachments", error);
    throw new Error("Attachment upload failed");
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
    const response = await axios.del(`posts/${post._id}`, {});
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
};
