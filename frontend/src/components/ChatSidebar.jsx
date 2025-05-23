import {
  Typography,
  Box,
  useTheme,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import Modal from "./Modal";
import CreateDM from "../features/dms/CreateDM";
import CustomList from "./CustomList";

export default function ChatSidebar({
  type,
  title,
  chatList,
  // eslint-disable-next-line no-unused-vars
  ChatListItem,
  // eslint-disable-next-line no-unused-vars
  CreateChat,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  function handleOenModal() {
    setShowCreateModal(true);
  }

  function handleCloseModal() {
    setShowCreateModal(false);
  }
  const theme = useTheme();
  console.log(theme.palette.background.default);
  return (
    <Paper sx={{ minWidth: "fit-content", height: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ padding: "1em", width: "100%" }}
      >
        <Typography variant="h5">{title}</Typography>

        <IconButton
          onClick={handleOenModal}
          sx={{ color: theme.palette.primary.main, textAlign: "right" }}
        >
          <AddIcon fontSize="large" />
        </IconButton>
      </Stack>

      <Stack
        direction="column"
        justifyContent="center"
        width="100%"
        padding="1rem"
      >
        {!chatList || chatList.length == 0 ? (
          <Typography>Add {type} to chat!</Typography>
        ) : (
          <CustomList
            listData={chatList}
            mappingFunction={(item) => {
              return <ChatListItem key={item._id} item={item} />;
            }}
          />
        )}
      </Stack>

      {showCreateModal && (
        <Modal isOpen={showCreateModal} handleClose={handleCloseModal}>
          {" "}
          <CreateChat handleCloseModal={handleCloseModal} />{" "}
        </Modal>
      )}
    </Paper>
  );
}
