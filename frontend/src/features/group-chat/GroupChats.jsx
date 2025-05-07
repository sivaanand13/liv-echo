import { Link } from "react-router";
import { Box, List, ListItem, Stack, Typography } from "@mui/material";
import landing1 from "../../assets/landing/landing1.jpg";
import CustomLink from "../../components/CustomLink.jsx";
import ChatSidebar from "../../components/ChatSidebar.jsx";
import MessageDisplay from "../chat/MessageDisplay.jsx";
import chatStore from "../../stores/chatStore.js";
import { useEffect } from "react";
import DMsListItem from "./GroupChatListItem.jsx";
import groupChatUtils from "./groupChatUtils.js";
import CreateGroupChat from "./CreateGroupChat.jsx";
import GroupChatListItem from "./GroupChatListItem.jsx";
export default function GroupChats() {
  const groupChats = chatStore((state) => state.groupChats);
  const setGroupChats = chatStore((state) => state.setGroupChats);

  useEffect(() => {
    const fetchUserGroupChats = async () => {
      const chats = await groupChatUtils.getUserGroupChats();
      console.log("User group chats: ", chats);
      setGroupChats(chats);
    };

    fetchUserGroupChats();
  }, [setGroupChats]);
  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 4rem)" }}>
      <Box
        sx={{
          flex: 1,
          minWidth: "fit-content",
          borderRight: 1,
          borderColor: "divider",
        }}
      >
        <ChatSidebar
          type="Group Chats"
          title="Group Chats"
          chatList={groupChats}
          ChatListItem={GroupChatListItem}
          CreateChat={CreateGroupChat}
        />
      </Box>
      <Box sx={{ flex: 4, p: 2 }}>
        <MessageDisplay />
      </Box>
    </Box>
  );
}
