import { useContext } from "react";
import Profile from "../../components/Profile";
import { Typography, ListItemAvatar, ListItemText, Stack } from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";
import ChatListItem from "../../components/ChatListItem";

export default function DMsListItem({ item: chat }) {
  const { user } = useContext(AuthContext);
  console.log("dm chat: ", chat);
  let displayUser =
    chat.members.find((member) => member.uid !== user.uid) || chat.members[0];
  console.log("DM display: ", displayUser);
  let preview = `${
    chat.latestMessage?.sender.username || chat.latestMessage?.senderName || ""
  }: ${chat?.latestMessage?.text}`;
  if (preview.length > 30) {
    preview = preview.slice(0, 30) + "...";
  }
  return (
    <ChatListItem item={chat} key={chat._id.toString()}>
      <ListItemAvatar>
        <Profile user={displayUser} />
      </ListItemAvatar>
      <ListItemText
        disableTypography={true}
        primary={`${displayUser?.name || "Name not avaliable"} (${
          chat?.members.length == 1
            ? "EMPTY"
            : displayUser?.username || "Username not avaliable"
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
