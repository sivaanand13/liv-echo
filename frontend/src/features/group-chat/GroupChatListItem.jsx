import { useContext } from "react";
import Profile from "../../components/Profile";
import {
  ListItem,
  Typography,
  ListItemAvatar,
  ListItemText,
  Stack,
} from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";
import ChatListItem from "../../components/ChatListItem";

export default function GroupChatListItem({ item: chat }) {
  return (
    <ChatListItem item={chat} key={chat._id.toString()}>
      <ListItemAvatar>
        <Profile user={chat} />
      </ListItemAvatar>
      <ListItemText
        disableTypography={true}
        primary={chat?.name || "Name not avaliable"}
        secondary={
          <Stack direction={"column"}>
            {chat?.latestMessage?.text && (
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.primary", display: "inline" }}
              >
                {chat.latestMessage.text}
              </Typography>
            )}
          </Stack>
        }
      />
    </ChatListItem>
  );
}
