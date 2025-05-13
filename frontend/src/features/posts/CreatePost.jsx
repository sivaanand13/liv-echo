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
  Stack,
} from "@mui/material";
import postBg from "../../assets/users/search.jpg";
import { useNavigate } from "react-router";
import validation from "../../utils/validation";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
function CreatePost() {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  let navigate = useNavigate();
  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      validation.validateString(text, "Post text");

      let post;
      try {
        post = await postUtils.createPost(text, attachments, isPrivate);
      } catch (e) {
        if (typeof e == "string") {
          throw e;
        }
        throw `Failed to create post!`;
      }
      setMessage("Post created successfully!");
      setText("");
      setAttachments([]);
      setIsPrivate(false);
      navigate(`/posts/${post._id}`);
    } catch (err) {
      setMessage(err);
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
          sx={{ marginBottom: "20px" }}
        />

        <Box
          component="label"
          sx={{
            display: "flex",
            padding: "10px 20px",
            backgroundColor: "orange",
            color: "white",
            cursor: "pointer",
            borderRadius: "5px",
            textAlign: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <Stack direction="row" spacing={2}>
            <CloudUploadIcon color="white" />
            <Typography> Upload Attachments</Typography>

            <input
              type="file"
              hidden
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </Stack>
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
