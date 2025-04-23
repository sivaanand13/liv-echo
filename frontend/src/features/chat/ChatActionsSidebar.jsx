import { Button, Stack, Typography, Box } from "@mui/material";
import CurrentChatMembers from "./CurrentChatMembers";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import chatStore from "../../stores/chatStore";
import LeaveChatDialog from "./LeaveChatDialog";
import DeleteChatDialog from "./DeleteChatDialog";
import EditGroupChatDialog from "../group-chat/EditGroupChatDialog";
import ChangeAdminDialog from "../group-chat/ChangeAdminDialog";
export default function ChatActionsSidebar() {
  const [openLeaveChat, setOpenLeaveChat] = useState(false);
  const [openDeleteChat, setOpenDeleteChat] = useState(false);
  const [openEditChat, setOpenEditChat] = useState(false);
  const [openChangeAdminChat, setOpenChangeAdminChat] = useState(false);

  function handleClose() {
    setOpenLeaveChat(false);
    setOpenDeleteChat(false);
    setOpenEditChat(false);
    setOpenChangeAdminChat(false);
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
            <Button onClick={() => setOpenEditChat(!openEditChat)}>
              Edit Chat
            </Button>
            <Button
              onClick={() => setOpenChangeAdminChat(!openChangeAdminChat)}
            >
              Change Admin
            </Button>
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
      <EditGroupChatDialog open={openEditChat} handleClose={handleClose} />
      <ChangeAdminDialog open={openChangeAdminChat} handleClose={handleClose} />
    </Stack>
  );
}
