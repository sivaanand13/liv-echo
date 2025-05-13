import { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Grid,
  Stack,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneIcon from "@mui/icons-material/Done";
import { useNotification } from "../contexts/NotificationContext";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function NotificationCenter() {
  const { notifications, markAsRead } = useNotification();
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNavigate = (navigationLink) => {
    if (navigationLink !== "") navigate(navigationLink);
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (notifications) console.log(notifications);
  }, [notifications]);

  return (
    <>
      <IconButton onClick={handleOpen} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 400,
              width: 300,
            },
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n._id}
              selected={!n.read}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 1,
                width: "100%",
                py: 1,
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  cursor: "pointer",
                }}
                onClick={() => handleNavigate(n.link)}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}
                >
                  {n.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}
                >
                  {n.body}
                </Typography>
              </Box>

              <IconButton
                size="small"
                edge="end"
                sx={{ mt: "4px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(n._id);
                }}
              >
                <DoneIcon fontSize="small" />
              </IconButton>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
