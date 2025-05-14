import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import chatStore from "../../stores/chatStore";
import chatUtils from "./chatUtils";
export default function LeaveChatDialog({ open, handleClose }) {
  const { currentChat } = chatStore();

  async function handleLeaveChat(e) {
    e.preventDefault();
    // console.log("Trying to leave chat:", currentChat._id.toString());
    try {
      await chatUtils.leaveChat(currentChat);
      handleClose();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle align="center">{`Leave Chat`}</DialogTitle>
      <DialogContent>
        {currentChat.type == "dm" ? (
          <DialogContentText align="center">
            Are you sure you want to leave this DM chat?
          </DialogContentText>
        ) : (
          <DialogContentText align="center">
            Are you sure you want to leave the
            {currentChat.name + ` (${currentChat._id}) chat?`}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ display: "flex" }}>
        <Button sx={{ flex: 1 }} onClick={handleLeaveChat}>
          Leave
        </Button>
        <Button sx={{ flex: 1 }} onClick={handleClose} autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
