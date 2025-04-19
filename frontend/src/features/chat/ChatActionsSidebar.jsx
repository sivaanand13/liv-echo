import { Button, Stack, Typography, Box } from "@mui/material";
import CurrentChatMembers from "./CurrentChatMembers";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import chatStore from "../../stores/chatStore";
import LeaveChatDialog from "./LeaveChatDialog";
import DeleteChatDialog from "./DeleteChatDialog";
import EditChatDialog from "./EditChatDialog";
export default function ChatActionsSidebar() {
  const [openLeaveChat, setOpenLeaveChat] = useState(false);
  const [openDeleteChat, setOpenDeleteChat] = useState(false);
  const [openEditChat, setOpenEditChat] = useState(false);

  function handleClose() {
    setOpenLeaveChat(false);
    setOpenDeleteChat(false);
    setOpenEditChat(false);
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
        {currentChat?.admins.find(
          (admin) => admin.uid == auth?.currentUser?.uid
        ) ? (
          <Stack>
            <Button onClick={() => setOpenDeleteChat(!openDeleteChat)}>
              Delete Chat
            </Button>
            <Button>Edit Chat</Button>
          </Stack>
        ) : (
          <Stack>
            <Button onClick={() => setOpenLeaveChat(!openLeaveChat)}>
              Leave Chat
            </Button>
          </Stack>
        )}
      </Box>

      <LeaveChatDialog open={openLeaveChat} handleClose={handleClose} />
      <DeleteChatDialog open={openDeleteChat} handleClose={handleClose} />
      <EditChatDialog open={openEditChat} handleClose={handleClose} />
    </Stack>
  );
}
