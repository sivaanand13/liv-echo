import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import chatStore from "../../stores/chatStore";
export default function DeleteChatDialog({ open, handleClose }) {
  const { currentChat } = chatStore();

  function handleLeaveChat(e) {
    e.preventDefault();
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
          We recommend editing the chat to select another admin if you just want
          to leave the chat!
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ display: "flex" }}>
        <Button sx={{ flex: 1 }} onClick={handleLeaveChat}>
          Delete
        </Button>
        <Button sx={{ flex: 1 }} onClick={handleClose} autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
