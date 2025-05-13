import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import { useState } from "react";
import postUtils from "./postUtils";

export default function DeletePostDialog({
  open,
  handleClose,
  postId,
  onDeleteSuccess,
}) {
  const [error, setError] = useState("");

  async function handleDelete(e) {
    e.preventDefault();
    setError("");
    try {
      await postUtils.deletePost(postId);
      handleClose();
      onDeleteSuccess();
    } catch (e) {
      console.error(e);
      setError("Failed to delete post.");
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle align="center">Delete Post</DialogTitle>
      <DialogContent>
        <DialogContentText align="center">
          Are you sure you want to delete this post? This action cannot be
          undone.
        </DialogContentText>
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ display: "flex" }}>
        <Button sx={{ flex: 1 }} onClick={handleDelete} color="error">
          Delete
        </Button>
        <Button sx={{ flex: 1 }} onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
