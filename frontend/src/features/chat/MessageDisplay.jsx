import {
  Stack,
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Divider,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  CardMedia,
} from "@mui/material";
import chatStore from "../../stores/chatStore";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import validation from "../../utils/validation";
import chatUtils from "./chatUtils";
import CustomList from "../../components/CustomList";
import Profile from "../../components/Profile";
import MessageListItem from "./MessageListItem";
import CloseIcon from "@mui/icons-material/Close";

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
              <Typography variant="h3" margin="2rem">
                {currentChat.name}
              </Typography>
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
                    return <MessageListItem msg={msg} />;
                  }}
                />
              )}
            </Stack>
          </Box>
          {attachments && attachments.length > 0 && (
            <ImageList
              cols={attachments.length}
              sx={{
                position: "relative",
                maxHeight: "20vh",
                borderRadius: "0.5rem",
                flexWrap: "flex",
                overflowX: "auto",
                overflowY: "hidden",
                boxShadow: 1,
              }}
            >
              {attachments.map((attachment, index) => {
                console.log(attachment);
                return (
                  <ImageListItem key={index} sx={{ maxHeight: "15vh" }}>
                    <img
                      alt={`Attachment ${index + 1}`}
                      src={URL.createObjectURL(attachment)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                    <ImageListItemBar
                      position="top"
                      title={attachment.name}
                      actionIcon={
                        <IconButton
                          sx={{ color: "red" }}
                          aria-label={`remove ${attachment.name}`}
                          onClick={() => {
                            setAttachments((prev) =>
                              prev.filter((file, i) => index != i)
                            );
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      }
                      actionPosition="left"
                    />
                  </ImageListItem>
                );
              })}
            </ImageList>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              margin: "2rem",
            }}
          >
            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "1em",
                marginBottom: "2rem",
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
              <IconButton component="label">
                <AddIcon />
                <input
                  accept="image/*"
                  id="profile"
                  name="profile"
                  multiple
                  type="file"
                  hidden
                  onChange={(e) => {
                    let files = Array.from(e.target.files);
                    if (files.length > 5) {
                      alert("Please limit attachments to five!");
                      files = files.slice(0, 5);
                    }
                    setAttachments(Array.from(files));
                  }}
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
