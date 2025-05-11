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
  Grid,
} from "@mui/material";
import postUtils from "./postUtils"; // Adjust the path as needed
import CommentListItem from "./CommentListItem";

export default function SinglePost() {
  const { postId } = useParams(); // Assumes a route like /posts/:postId
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function fetchPost() {
      try {
        const result = await postUtils.getPostByPostId(postId);
        setPost(result);
        const coms = await postUtils.getComments(postId);
        setComments(coms);
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
            {post.attachments && post.attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Attachments:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                  {post.attachments.map((attachment) =>
                    attachment.resource_type === "image" ? (
                      <Box key={attachment._id} sx={{ maxWidth: "100%" }}>
                        <img
                          src={attachment.secure_url}
                          alt="attachment"
                          style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }}
                        />
                      </Box>
                    ) : null
                  )}
                </Box>
              </Box>
              )}
            {post.isPrivate && (
              <Typography variant="caption" color="warning.main">
                Private Post
              </Typography>
            )}
          </CardContent>
        </Card>
      </Paper>
      <Grid container spacing={3} justifyContent="center">
        {comments.map((comment) => (
          <Grid item xs={12} sm={6} md={4} key={comment._id}>
              <CommentListItem item={comment} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
