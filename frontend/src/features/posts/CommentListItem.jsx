import {
  ListItem,
  Stack,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Menu,
  MenuItem,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import Profile from "../../components/Profile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import postUtils from "./postUtils";
import CustomLink from "../../components/CustomLink";
import { formatDistanceToNow } from "date-fns";

export default function CommentListItem({ item: msg }) {
  const { currentUser, serverUser } = useContext(AuthContext);
  const auth = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ancor, setAncor] = useState(null);
  const [liked, setLiked] = useState(false);
  const [lik, setLik] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(msg.text);
  const [tempText, setTempText] = useState(msg.text);

  useEffect(() => {
    async function fetchLiked() {
      const likedByCurrentUser = msg.likes.includes(serverUser._id);
      setLiked(likedByCurrentUser);
      setLik(!likedByCurrentUser);
    }
    fetchLiked();
  }, [currentUser._id, msg]);

  function handleOpen(e) {
    setMenuOpen((prev) => !prev);
    setAncor(e.currentTarget);
  }
  function handleClose() {
    setMenuOpen(false);
  }

  async function handleEdit() {
    setEditing(true);
    handleClose();
  }

  async function handleLike() {
    try {
      let n = await postUtils.likeCommentByID(msg.post, msg._id);
      setLiked(n);
    } catch (e) {
      console.log(e);
    }
    handleClose();
  }

  async function handleDelete() {
    try {
      await postUtils.deleteComment(msg.post, msg._id);
    } catch (e) {
      console.log(e);
    }
    handleClose();
  }
  async function handleSaveEdit() {
    try {
      const updated = await postUtils.editComment(msg.post, msg._id, {
        text: tempText,
      });
      setText(updated.text);
      setEditing(false);
    } catch (e) {
      console.log("Edit failed:", e);
    }
  }
  function handleCancelEdit() {
    setTempText(text);
    setEditing(false);
  }
  const isCommentor =
    serverUser.uid === msg.sender?.uid || serverUser.role === "admin";
  return (
    <ListItem
      sx={{
        backgroundColor: "#611F69",
        backdropFilter: "blur(10px)",
        borderRadius: "0.5em",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        color: "white",
        padding: "1rem",
        width: "100%",
        marginY: "1rem",
      }}
    >
      <Stack direction="column">
        <Stack direction="row">
          <ListItemAvatar>
            <Profile user={msg.sender} />
          </ListItemAvatar>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <Typography variant="caption">
                <CustomLink
                  to={`/users/${msg.sender?.uid}`}
                  sx={{
                    color: "white",
                    textDecoration: "underline",

                    "&:hover": {
                      color: "red",
                      textDecoration: "none",
                    },
                  }}
                >
                  {msg.senderUsername || "Unknown"}
                </CustomLink>
              </Typography>
              <Typography variant="caption">
                {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
              </Typography>
            </Stack>
            {!editing ? (
              <Typography variant="body1">{text}</Typography>
            ) : (
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  multiline
                  variant="outlined"
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveEdit}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
          {(auth.currentUser.uid == msg.sender?.uid ||
            auth.currentUser.role == "admin") && (
            <>
              <IconButton
                onClick={handleOpen}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                }}
              >
                <MoreVertIcon color="secondary" />
              </IconButton>
              <Menu
                anchorEl={ancor}
                id="message-menu-bar"
                aria-labelledby="message-menu-bar"
                open={menuOpen}
                onClose={handleClose}
              >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
              </Menu>
            </>
          )}
        </Stack>
        {msg.attachments?.length > 0 && (
          <Box sx={{ width: "55vw" }}>
            <ImageList
              sx={{
                maxWidth: "100%",
                width: "contain",
              }}
            >
              {msg.attachments.map((file, index) => {
                return (
                  <ImageListItem key={index} sx={{ maxHeight: "15vh" }}>
                    <img
                      alt={`Attachment ${index + 1}`}
                      src={file.url}
                      style={{
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </ImageListItem>
                );
              })}
            </ImageList>
          </Box>
        )}

        <ListItemButton
          onClick={() => {
            handleLike();
            //setLiked((prev) => !prev);
            console.log(`${!liked ? "Liked" : "Unliked"} post:`, msg._id);
            // Optional: postUtils.likePost(msg._id, !liked)
          }}
          sx={{
            mt: 1,
            px: 1.5,
            py: 0.5,
            width: "fit-content",
            borderRadius: "0.5em",
            backgroundColor: "#ffffff15",
            color: "white",
            display: "flex",
            alignItems: "center",
            "&:hover": {
              backgroundColor: "#ffffff25",
            },
          }}
        >
          <Typography variant="body1" sx={{ paddingRight: 0.5 }}>
            {msg.likes.length + (lik ? liked : 0 - !liked)}
          </Typography>
          {liked ? (
            <ThumbUpAltIcon fontSize="small" sx={{ mr: 1 }} />
          ) : (
            <ThumbUpOffAltIcon fontSize="small" sx={{ mr: 1 }} />
          )}
          <Typography variant="body2">{liked ? "Liked" : "Like"}</Typography>
        </ListItemButton>
      </Stack>
    </ListItem>
  );
}
