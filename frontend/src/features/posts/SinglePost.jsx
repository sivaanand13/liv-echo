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
  TextField,
  Stack,
  Alert,
} from "@mui/material";
import postUtils from "./postUtils"; // Adjust the path as needed
import CommentListItem from "./CommentListItem";
import EditPostDialog from "./EditPostDialog";
import { AuthContext } from "../../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import CustomLink from "../../components/CustomLink";
import SendIcon from "@mui/icons-material/Send";
import { Padding } from "@mui/icons-material";
import ReportPostDialog from "./reportPostDialogue";


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
  const [newComment, setNewComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [commentError, setCommentError] = useState("");
  const senderId =
    typeof post?.sender === "object" ? post.sender._id : post?.sender;
  const canDelete =
    serverUser?._id.toString() === senderId?.toString() ||
    serverUser?.role === "admin";
  const canEdit = serverUser?._id.toString() === senderId?.toString()

  //console.log("I I EXIST ", canDelete);
  //console.log("user 1", serverUser?._id);
  console.log("user 2", post?.sender);
  async function handleReportPost() {
    try {
      await postUtils.reportPost(postId); // Define this in your utils to call your backend
      alert("Post reported successfully.");
    } catch (err) {
      console.error("Failed to report post:", err.message);
      alert("Failed to report post.");
    }
}

  useEffect(() => {
    async function fetchPost() {
      try {
        console.log("Im post", postId);
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
  async function handleEditSuccess() {
    try {
      const updatedPost = await postUtils.getPostByPostId(postId);
      setPost(updatedPost);
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to re-fetch post after edit:", err);
    }
  }
  async function handleAddComment() {
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    setCommentError("");
    try {
      const commentData = { text: newComment };
      const newCom = await postUtils.createComment(postId, commentData);
      setComments((prev) => [newCom, ...prev]); // Add new comment to top
      setNewComment("");
    } catch (err) {
      console.log(err.type);
      if (err.type === "moderation") {
        setNewComment("");
        setCommentError(err.message);
        return;
      }
      setNewComment("");
      setCommentError(err);
      console.error("Failed to add comment:", err);
    } finally {
      setCommentSubmitting(false);
    }
  }
  function handleCommentDelete(deletedCommentId) {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment._id !== deletedCommentId)
    );
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
          <CardHeader
            title={
              <CustomLink
                to={`/users/${post.sender?.uid || post.sender}`}
                sx={{
                  color: "black",
                  textDecoration: "none",

                  "&:hover": {
                    color: "red",
                    textDecoration: "none",
                  },
                }}
              >
                {post.senderUsername}
              </CustomLink>
            }
            subheader={post.senderName}
            action={
          currentUser && currentUser._id !== senderId && (
          <Button
              size="small"
              color="warning"
              onClick={() => setReportOpen(true)}
              sx={{ textTransform: "none" }}
          >
              Report
            </Button>
            )}
          />
          <CardContent>
            <Typography variant="body1" gutterBottom>
              {post.text}
            </Typography>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Posted {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </Typography>
            {post.attachments && post.attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Attachments:</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                  {post.attachments.map((attachment) =>
                    attachment.resource_type === "image" ? (
                      <Box key={attachment._id} sx={{ maxWidth: "100%" }}>
                        <img
                          src={attachment.secure_url}
                          alt="attachment"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "400px",
                            borderRadius: "8px",
                          }}
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
                {canEdit && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setEditOpen(true)}
                >
                  Edit Post
                </Button>
                )}
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
      <Paper
        elevation={1}
        sx={{
          maxWidth: "800px",
          mx: "auto",
          mt: 3,
          p: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Add a Comment
        </Typography>
        <Stack direction="column">
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              multiline
              variant="outlined"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              minRows={1}
              maxRows={6}
            />

            <Button
              variant="contained"
              onClick={handleAddComment}
              disabled={commentSubmitting}
            >
              <SendIcon />
            </Button>
          </Stack>
          {commentError && <Alert severity="error">{commentError}</Alert>}
        </Stack>
        <Grid container justifyContent="center" sx={{ width: "100%" }}>
          <Grid
            item
            xs={12}
            sm={10}
            md={8}
            lg={6}
            sx={{ pt: 1, pb: 0, width: "100%" }}
          >
            {comments.map((comment) => (
              <Box key={comment._id} sx={{ p: 0 }}>
                <CommentListItem
                  item={comment}
                  onDelete={handleCommentDelete}
                />
              </Box>
            ))}
          </Grid>
        </Grid>
      </Paper>
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
      <ReportPostDialog
        open={reportOpen}
        handleClose={() => setReportOpen(false)}
        postId={postId}
        onReportSuccess={() => {
        setReportOpen(false);}}
      />

    </Box>
  );
}
