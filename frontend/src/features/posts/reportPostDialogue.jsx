import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Select, 
  MenuItem,
  TextField
} from "@mui/material";
import { useState } from "react";
import postUtils from "./postUtils";

export default function reportPostDialogue({
  open,
  handleClose,
  postId,
  onReportSuccess,
}) {
  const [error, setError] = useState("");
  const [reportComment,setReportComment] = useState("");
  const [reportType,setReportType] = useState("")

  async function handleReport(e) {
    e.preventDefault();
    setError("");
    try {
      await postUtils.reportPost(postId,reportType,reportComment);
      handleClose();
      onReportSuccess();
    } catch (e) {
      console.error(e);
      setError("Failed to report post.");
    }
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle align="center">Report Post</DialogTitle>
      <DialogContent>
        <DialogContentText align="center">
          Are you sure you want to Report this post? This action cannot be
          undone.
        </DialogContentText>
        <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            fullWidth
            displayEmpty
            sx={{ mt: 2 }}
        >
            <MenuItem value="" disabled>Select report reason</MenuItem>
            <MenuItem value="spam">Spam</MenuItem>
            <MenuItem value="hateful">Harassment</MenuItem>
            <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
            <MenuItem value="misinformation">Misinformation</MenuItem>
            <MenuItem value="other">Other</MenuItem>
        </Select>
        <TextField
                  label="Comment Text"
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                />
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ display: "flex" }}>
        <Button sx={{ flex: 1 }} onClick={handleReport} color="error">
          Report
        </Button>
        <Button sx={{ flex: 1 }} onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
