import { Link } from "react-router";
import { Box, List, ListItem, Stack, Typography } from "@mui/material";
import landing1 from "../../assets/landing/landing1.jpg";
import CustomLink from "../../components/CustomLink";
import ChatSidebar from "../../components/ChatSidebar";
import MessageDisplay from "../chat/MessageDisplay.jsx";
import chatStore from "../../stores/chatStore";
import dmUtils from "./dmUtils.js";
import { useEffect } from "react";
import DMsListItem from "./DMsListItem.jsx";
import CreateDM from "./CreateDM.jsx";
function DirectMessages() {
  const directMessageChats = chatStore((state) => state.directMessageChats);
  const setDirectMessageChats = chatStore(
    (state) => state.setDirectMessageChats
  );

  useEffect(() => {
    const fetchUserDms = async () => {
      const dms = await dmUtils.getUserDMs();
      // console.log("User dms: ", dms);
      setDirectMessageChats(dms);
    };

    fetchUserDms();

    return () => {
      chatStore.getState().setCurrentChat(null);
      chatStore.getState().setCurrentMessages([]);
    };
  }, []);
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
          type="DMs"
          title="Direct Messages"
          chatList={directMessageChats}
          ChatListItem={DMsListItem}
          CreateChat={CreateDM}
        />
      </Box>
      <Box sx={{ flex: 4, p: 2 }}>
        <MessageDisplay />
      </Box>
    </Box>
  );
}

export default DirectMessages;
