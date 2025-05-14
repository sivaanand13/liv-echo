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
import { useEffect, useState } from "react";
import postUtils from "./postUtils";
import validation from "../../utils/validation";

export default function EditPostDialog({
  open,
  handleClose,
  post,
  onEditSuccess,
}) {
  // console.log("edit post: ", post);
  const [text, setText] = useState(post.text || "");
  const [isPrivate, setIsPrivate] = useState(post.isPrivate);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setError("");
      validation.validateString(text, "Post text");
      const updated = await postUtils.editPost(post._id, { text, isPrivate });
      onEditSuccess(updated);
      handleClose();
    } catch (e) {
      if (e.type === "moderation") {
        setError(`Moderation Error: ${e.message}`);
        return;
      }
      console.error(e);
      if (Array.isArray(e)) {
        e = e.join(" ");
      }
      if (typeof e == "string" || typeof e.message == "string") {
        setError(e.message || e);
        return;
      }

      setError("Failed to update post.");
      return;
    }
  };

  const handleCancel = () => {
    setText(post.text);
    setIsPrivate(post.isPrivate);
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
