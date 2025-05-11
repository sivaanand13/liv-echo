import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { useState } from "react";
import postUtils from "./postUtils";

export default function EditPostDialog({ open, handleClose, post, onEditSuccess }) {
  const [text, setText] = useState(post.text);
  const [isPrivate, setIsPrivate] = useState(post.isPrivate);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setError("");
      const updated = await postUtils.editPost(post._id, { text, isPrivate });
      onEditSuccess(updated);
      handleClose();
    } catch (e) {
      console.error(e);
      setError("Failed to update post.");
    }
  };

  const handleCancel = () => {
    setError("");
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Edit Post</DialogTitle>
      <DialogContent>
        <TextField
          label="Post Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
          }
          label="Private"
        />
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
