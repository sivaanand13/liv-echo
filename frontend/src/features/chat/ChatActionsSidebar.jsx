import { Button, Stack, Typography, Box } from "@mui/material";
import CurrentChatMembers from "./CurrentChatMembers";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import chatStore from "../../stores/chatStore";
import LeaveChatDialog from "./LeaveChatDialog";
export default function ChatActionsSidebar() {
  const [openLeaveChat, setOpenLeaveChat] = useState(false);

  function handleCloseLeaveChat() {
    setOpenLeaveChat(false);
  }
  const auth = useContext(AuthContext);
  const { currentChat } = chatStore();
  return (
    <Stack direction="column" spacing={2}>
      <Box>
        <Typography variant="h5">Members</Typography>
        <CurrentChatMembers />
      </Box>
      <Box>
        <Typography variant="h5">Chat Actions</Typography>
        <Stack direction="column">
          <Button onClick={() => setOpenLeaveChat(!openLeaveChat)}>
            Leave Chat
          </Button>
          {currentChat?.admins.find(
            (admin) => admin.uid == auth?.currentUser?.uid
          ) && <Button>Edit Chat</Button>}
        </Stack>
      </Box>

      <LeaveChatDialog
        open={openLeaveChat}
        handleClose={handleCloseLeaveChat}
      />
    </Stack>
  );
}
