// components/NotificationBell.jsx
import { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneIcon from "@mui/icons-material/Done";
import { useNotification } from "../contexts/NotificationContext";
import { useEffect } from "react";

export default function NotificationCenter() {
  const { notifications, markAsRead } = useNotification();
  const [anchorEl, setAnchorEl] = useState(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        {notifications.length === 0 && (
          <MenuItem disabled>No notifications</MenuItem>
        )}
        {notifications.map((n) => (
          <MenuItem
            key={n._id}
            selected={!n.read}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {n.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {n.body}
              </Typography>
            </Box>

            <IconButton
              size="small"
              edge="end"
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(n._id);
              }}
            >
              <DoneIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
