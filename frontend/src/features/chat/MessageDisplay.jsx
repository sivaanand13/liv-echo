import {
  Stack,
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import chatStore from "../../stores/chatStore";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import validation from "../../utils/validation";
import chatUtils from "./chatUtils";
import CustomList from "../../components/CustomList";
import Profile from "../../components/Profile";

export default function MessageDisplay({ chat }) {
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [messageError, setMessageError] = useState("");
  const {
    currentChat,
    currentChatMessages,
    setCurrentMessages,
    addCurrentChatMessages,
  } = chatStore();

  useEffect(() => {
    async function fetchMessages() {
      if (currentChat) {
        try {
          const messages = await chatUtils.getMessages(currentChat);
          console.log("fetched messages: ", messages);
          setCurrentMessages(messages);
        } catch (e) {
          console.log(e);
        }
      }
    }
    console.log(currentChat);
    fetchMessages();
  }, [currentChat]);

  function reset() {
    setMessageError("");
    setMessageText("");
    setAttachments([]);
  }

  async function handleSend(e) {
    e.preventDefault();
    setMessageError("");
    let curChat = currentChat;
    let curMessageText = messageText;
    let curAttachments = attachments;

    try {
      curMessageText = validation.validateString(curMessageText);

      validation.validateArray(curAttachments);
    } catch (e) {
      return setMessageError(e);
    }

    try {
      const message = await chatUtils.sendMessage(
        curChat,
        curMessageText,
        curAttachments
      );
      reset();
    } catch (e) {
      return;
    }
  }

  if (!currentChat) {
    return <Stack></Stack>;
  }

  return (
    <Stack
      height="100%"
      spacing={1}
      alignItems={"center"}
      justifyContent={"center"}
      textAlign={"center"}
      bgcolor={"white"}
      direction="column"
      flex={1}
      sx={{
        height: "calc(100vh - 5rem)",
        overflow: "hidden",
      }}
    >
      {currentChat ? (
        <>
          {currentChat?.type == "group" && (
            <Box>
              <Typography variant="h3">{currentChat.name}</Typography>
            </Box>
          )}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              pb: 2,
            }}
          >
            <Stack spacing={1}>
              {currentChatMessages && (
                <CustomList
                  sx={{ width: "60vw" }}
                  listData={currentChatMessages}
                  mappingFunction={(msg) => {
                    return (
                      <ListItem
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "0.5em",
                          marginBottom: "2em",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                      >
                        <ListItemAvatar>
                          <Profile user={msg.sender} />
                        </ListItemAvatar>
                        <ListItemText
                          disableTypography
                          primary={
                            <Typography variant="body1">{msg.text}</Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={3}>
                              <Typography variant="caption">
                                {new Date(msg.createdAt).toLocaleString()}
                              </Typography>
                              <Typography variant="caption">
                                {msg.sender?.username || "Unknown"}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    );
                  }}
                />
              )}
            </Stack>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "1em",
              }}
            >
              <TextField
                fullWidth
                id="messageInput"
                label="Message"
                placeholder="Enter term to search!"
                variant="standard"
                error={messageError != null}
                onChange={(e) => {
                  setMessageText(e.target.value);
                }}
                value={messageText}
                helperText={messageError}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <IconButton type="button">
                <AddIcon />
                <input
                  accept="image/*"
                  id="profile"
                  name="profile"
                  multiple={true}
                  type="file"
                  onChange={(e) => setAttachments(e.target.files)}
                  hidden={true}
                />
              </IconButton>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

              <IconButton type="button" onClick={handleSend}>
                <SendIcon />
              </IconButton>
            </Paper>
          </Box>{" "}
        </>
      ) : (
        <Typography variant="h3">Select a chat to message...</Typography>
      )}
    </Stack>
  );
}
