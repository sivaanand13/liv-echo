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
import { useContext, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import validation from "../../utils/validation";
import chatUtils from "./chatUtils";
import CustomList from "../../components/CustomList";
import MessageListItem from "./MessageListItem";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../../contexts/AuthContext";
import ChatActionsSidebar from "./ChatActionsSidebar";
export default function MessageDisplay({ chat }) {
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [messageError, setMessageError] = useState("");
  const auth = useContext(AuthContext);
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
          // console.log("fetched messages: ", messages);
          setCurrentMessages(messages);
        } catch (e) {
          console.log(e);
        }
      }
    }
    // console.log(currentChat);
    fetchMessages();
  }, [currentChat, setCurrentMessages]);

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
      const sender = currentChat.members.find(
        (member) => member.uid == auth.currentUser.uid
      );
      reset();

      await chatUtils.sendMessage(
        curChat,
        curMessageText,
        curAttachments,
        sender
      );
    } catch (e) {
      setMessageError(e);
      return;
    }
  }

  return (
    <Stack
      height="100%"
      minWidth="fit-content"
      spacing={1}
      textAlign={"center"}
      bgcolor={"white"}
      direction="column"
      flex={1}
      sx={{
        height: "calc(100vh - 5rem)",
        display: "flex",
      }}
    >
      {currentChat ? (
        <>
          <Stack
            height="100%"
            direction="row"
            sx={{
              flex: 1,
              overflowY: "auto",
            }}
            alignItems="flex-start"
          >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                padding: "1rem",
                height: "calc(100vh - 5rem)",
              }}
            >
              {currentChat?.type == "group" && (
                <Box>
                  <Typography variant="h3" marginTop="2rem">
                    {currentChat.name}
                  </Typography>
                </Box>
              )}
              <Stack
                spacing={1}
                sx={{
                  marginTop: "2rem",
                  marginBottom: "1rem",
                  margin: "1rem",
                  flex: 1,
                  overflowY: "auto",
                }}
              >
                {currentChatMessages && currentChatMessages.length > 0 ? (
                  <CustomList
                    listData={currentChatMessages}
                    mappingFunction={(msg) => {
                      return (
                        <MessageListItem
                          msg={msg}
                          admins={currentChat.admins}
                        />
                      );
                    }}
                  />
                ) : (
                  <Typography textAlign="center">No messages yet...</Typography>
                )}
              </Stack>
              {attachments && attachments.length > 0 && (
                <ImageList
                  cols={attachments.length}
                  sx={{
                    position: "relative",
                    maxHeight: "20vh",
                    borderRadius: "0.5rem",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    overflowY: "hidden",
                    boxShadow: 1,
                  }}
                >
                  {attachments.map((attachment, index) => {
                    {
                      /* console.log(attachment); */
                    }
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
                  zIndex: 1,
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
                  <label htmlFor="file-upload">
                    <IconButton component="span">
                      <AddIcon />
                    </IconButton>
                  </label>

                  <input
                    id="file-upload"
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      let files = Array.from(e.target.files);
                      if (files.length > 5) {
                        alert("Please limit attachments to five!");
                        files = files.slice(0, 5);
                      }
                      setAttachments(Array.from(files));
                    }}
                  />
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

                  <IconButton type="button" onClick={handleSend}>
                    <SendIcon />
                  </IconButton>
                </Paper>
              </Box>{" "}
            </Box>

            <Box
              sx={{
                overflowY: "auto",
                border: "1em",
                position: "sticky",
                top: "5rem",
                padding: "1rem",
              }}
            >
              <ChatActionsSidebar />
            </Box>
          </Stack>
        </>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography align="center" variant="h3">
            Select a chat to message...
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
