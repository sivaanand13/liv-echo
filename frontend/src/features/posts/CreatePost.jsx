// src/features/posts/CreatePost.jsx
import React, { useState } from "react";
import postUtils from "./postUtils";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import postBg from "../../assets/users/search.jpg";

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
    <Box
      sx={{
        backgroundImage: `url(${postBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: "8px",
          padding: "30px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: "20px" }}>
          Create Post
        </Typography>

        <TextField
          label="What's on your mind?"
          multiline
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          required
          sx={{ marginBottom: "20px" }}
        />

        <Box
          component="label"
          sx={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: 'primary.main',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '5px',
            textAlign: 'center',
          }}
        >
          Upload Attachments
          <input
            type="file"
            hidden
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
        </Box>

        <Box sx={{ marginBottom: "20px" }}>
          {attachments.length > 0 && (
            <Typography variant="body2">
              {attachments.length} file(s) selected
            </Typography>
          )}
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
          }
          label="Private Post"
          sx={{ marginBottom: "20px" }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Post"}
        </Button>

        {message && (
          <Typography
            sx={{ marginTop: "20px" }}
            color={message.includes("success") ? "primary" : "error"}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default CreatePost;
