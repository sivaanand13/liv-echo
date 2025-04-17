import {
  ListItem,
  Stack,
  ListItemAvatar,
  Box,
  Typography,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import Profile from "../../components/Profile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import chatUtils from "./chatUtils";
export default function MessageListItem({ msg, admins }) {
  const auth = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ancor, setAncor] = useState(null);
  function handleOpen(e) {
    setMenuOpen((prev) => !prev);
    setAncor(e.currentTarget);
  }
  function handleClose() {
    setMenuOpen(false);
  }

  async function handleDelete() {
    try {
      await chatUtils.deleteMessage(msg);
    } catch (e) {
      console.log(e);
    }
    handleClose();
  }
  return (
    <ListItem
      sx={{
        backgroundColor: "#611F69",
        backdropFilter: "blur(10px)",
        borderRadius: "0.5em",
        marginBottom: "2em",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        color: "white",
        padding: "1rem",
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
                {msg.sender?.name || msg.sender?.username || "Unknown"}
              </Typography>
              <Typography variant="caption">
                {new Date(msg.createdAt).toLocaleString()}
              </Typography>
            </Stack>

            <Typography variant="body1">{msg.text}</Typography>
          </Stack>
          {(auth.currentUser.uid == msg.sender.uid ||
            admins.find((admin) => admin.uid == auth.currentUser.uid)) && (
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
      </Stack>
    </ListItem>
  );
}
