// src/features/posts/CreatePost.jsx
import React, { useState } from "react";
import postUtils from "./postUtils"; 

function CreatePost() {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await postUtils.createPost(text, attachments, isPrivate);
      setMessage("Post created successfully!");
      setText("");
      setAttachments([]);
      setIsPrivate(false);
    } catch (err) {
      setMessage("Failed to create post." + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          required
        />

        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*"
        />

        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Private Post
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreatePost;
