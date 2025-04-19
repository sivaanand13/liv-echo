import { useContext } from "react";
import Profile from "../../components/Profile";
import { Typography, ListItemAvatar, ListItemText, Stack } from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";
import ChatListItem from "../../components/ChatListItem";

export default function DMsListItem({ item: chat }) {
  console.log(chat);
  const auth = useContext(AuthContext);
  const user = chat.members.find((member) => member.uid !== auth.uid);
  let preview = `${
    chat.latestMessage?.sender.username || chat.latestMessage?.senderName || ""
  }: ${chat?.latestMessage?.text}`;
  if (preview.length > 30) {
    preview = preview.slice(0, 30) + "...";
  }
  return (
    <ChatListItem item={chat} key={chat._id.toString()}>
      <ListItemAvatar>
        <Profile user={user} />
      </ListItemAvatar>
      <ListItemText
        disableTypography={true}
        primary={`${user?.name || "Name not avaliable"} (${
          user.username || "Username not avaliable"
        })`}
        secondary={
          <Stack direction={"column"}>
            {chat?.latestMessage?.text ? (
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.primary", display: "inline" }}
              >
                {preview}
              </Typography>
            ) : (
              <Typography
                component="span"
                variant="body2"
                sx={{ color: "text.primary", display: "inline" }}
              >
                No Messages yet
              </Typography>
            )}
          </Stack>
        }
      />
    </ChatListItem>
  );
}
