import { ListItem } from "@mui/material";
import chatStore from "../stores/chatStore";
export default function ChatListItem({ item, key, children }) {
  const { setCurrentChat } = chatStore();

  return (
    <ListItem
      key={key}
      onClick={() => setCurrentChat(item)}
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "12px",
        margin: "0.5em",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </ListItem>
  );
}
