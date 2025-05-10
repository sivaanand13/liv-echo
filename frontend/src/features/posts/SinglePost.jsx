import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import postUtils from "./postUtils"; // Adjust the path as needed

export default function SinglePost() {
  const { postId } = useParams(); // Assumes a route like /posts/:postId
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPost() {
      try {
        const result = await postUtils.getPostByPostId(postId);
        setPost(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load post.");
      }
      setLoading(false);
    }
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" mt={4}>
        {error}
      </Typography>
    );
  }

  if (!post) {
    return (
      <Typography textAlign="center" mt={4}>
        Post not found.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
        <Card elevation={1}>
          <CardHeader title={post.senderUsername} subheader={post.senderName} />
          <CardContent>
            <Typography variant="body1" gutterBottom>
              {post.text}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Posted on {new Date(post.createdAt).toLocaleString()}
            </Typography>
            {post.isPrivate && (
              <Typography variant="caption" color="warning.main">
                Private Post
              </Typography>
            )}
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
}
