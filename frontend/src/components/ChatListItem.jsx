import { ListItem } from "@mui/material";
import chatStore from "../stores/chatStore";
export default function ChatListItem({ item, key, children }) {
  const { setCurrentChat, currentChat } = chatStore();

  return (
    <ListItem
      key={key}
      onClick={() => setCurrentChat(item)}
      sx={{
        backgroundColor:
          currentChat && item._id == currentChat._id
            ? "rgba(0, 255, 255, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "0.5em",
        marginBottom: "2em",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </ListItem>
  );
}
