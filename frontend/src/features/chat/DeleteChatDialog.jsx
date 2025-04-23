import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  useScrollTrigger,
} from "@mui/material";
import chatStore from "../../stores/chatStore";
import chatUtils from "./chatUtils";
import { useState } from "react";
export default function DeleteChatDialog({ open, handleClose }) {
  const { currentChat } = chatStore();
  const [error, setError] = useState("");
  function handleCloseModal(e) {
    setError("");

    e.preventDefault();
    handleClose();
  }

  async function handleDeleteChat(e) {
    e.preventDefault();
    setError("");
    try {
      await chatUtils.deleteChat(currentChat);
      handleClose();
    } catch (e) {
      console.log(e);
      setError("Delete chat failed");
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle align="center">{`Delete Chat`}</DialogTitle>
      <DialogContent>
        <DialogContentText align="center">
          Are you sure you want to delete
          {currentChat.name + ` (${currentChat._id}) chat?`}
        </DialogContentText>
        <DialogContentText color="error" align="center">
          <strong>All members will lose access</strong>
        </DialogContentText>
        <DialogContentText variant="caption" align="center">
          We recommend selecting another admin if you just want to leave the
          chat!
        </DialogContentText>
      </DialogContent>
      {error && <Alert severity="error">{error}</Alert>}
      <DialogActions sx={{ display: "flex" }}>
        <Button sx={{ flex: 1 }} onClick={handleDeleteChat}>
          Delete
        </Button>
        <Button sx={{ flex: 1 }} onClick={handleCloseModal}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
