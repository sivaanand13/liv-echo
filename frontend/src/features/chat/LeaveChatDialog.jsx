import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import chatStore from "../../stores/chatStore";
export default function LeaveChatDialog({ open, handleClose }) {
  const { currentChat } = chatStore();

  function handleLeaveChat(e) {
    e.preventDefault();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle align="center">{`Leave Chat`}</DialogTitle>
      <DialogContent>
        <DialogContentText align="center">
          Are you sure you want to leave chat{" "}
          {currentChat.name + ` (${currentChat._id})?`}
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
