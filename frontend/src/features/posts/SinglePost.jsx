import React, { useEffect, useState, useContext } from "react";
import DeletePostDialog from "./DeletePostDialog";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Button,
  Stack
} from "@mui/material";
import postUtils from "./postUtils"; // Adjust the path as needed
import CommentListItem from "./CommentListItem";
import EditPostDialog from "./EditPostDialog";
import { AuthContext } from "../../contexts/AuthContext";

export default function SinglePost() {
  const { currentUser, serverUser } = useContext(AuthContext);
  const { postId } = useParams(); // Assumes a route like /posts/:postId
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [comments, setComments] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const canDelete =
    serverUser?._id.toString() === post?.sender.toString() || serverUser?.role === "admin";
  // console.log("I I EXIST ", canDelete);
  // console.log("user 1", serverUser?._id);
  // console.log("user 2", post?.sender);

  useEffect(() => {
    async function fetchPost() {
      try {
        console.log("Im post",postId)
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
  function handleDeleteSuccess() {
    navigate("/");
  }
  function handleEditSuccess(updatedPost) {
    setPost(updatedPost);
    setEditOpen(false);
  }
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
            {canDelete && (
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setEditOpen(true)}
                >
                  Edit Post
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete Post
                </Button>
              </Stack>
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
      <DeletePostDialog
        open={deleteOpen}
        handleClose={() => setDeleteOpen(false)}
        postId={postId}
        onDeleteSuccess={handleDeleteSuccess}
      />
      <EditPostDialog
        open={editOpen}
        handleClose={() => setEditOpen(false)}
        post={post}
        onEditSuccess={handleEditSuccess}
      />
    </Box>
  );
}
