import { useContext } from "react";
import Profile from "../../components/Profile";
import { Typography, ListItemAvatar, ListItemText, Stack } from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";
import ChatListItem from "../../components/ChatListItem";

export default function DMsListItem({ item: chat }) {
  const auth = useContext(AuthContext);
  const user = chat.members.find((member) => member.uid !== auth.uid);
  return (
    <ChatListItem item={chat} key={chat._id.toString()}>
      <ListItemAvatar>
        <Profile user={user} />
      </ListItemAvatar>
      <ListItemText
        disableTypography={true}
        primary={user?.name || "Name not avaliable"}
        secondary={
          <Stack direction={"column"}>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "text.primary", display: "inline" }}
            >
              {user.username || "Username not avaliable"}
            </Typography>
          </Stack>
        }
      />
    </ChatListItem>
  );
}
