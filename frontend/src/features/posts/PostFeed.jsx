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
import postUtils from "./postUtils";
import CustomList from "../../components/CustomList";
import PostListItem from "./PostListItem";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../../contexts/AuthContext";
//import ChatActionsSidebar from "./ChatActionsSidebar";
export default function PostFeed() {
  const auth = useContext(AuthContext);
  const attachments = null;
  let [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const pos = await postUtils.getPosts();
        console.log("fetched messages: ", pos);
        setPosts(pos);
      } catch (e) {
        console.log(e);
      }
    }
    fetchMessages();
    console.log("OK!");
    console.log(posts.length);
    //console.log(currentChat);
  }, []);

  function reset() {
    setMessageError("");
    setMessageText("");
    setAttachments([]);
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
      {posts ? (
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
                {posts && posts.length > 0 ? (
                  <CustomList
                    listData={posts}
                    mappingFunction={(msg) => {
                      return <PostListItem msg={msg} />;
                    }}
                  />
                ) : (
                  <Typography textAlign="center">{posts.length}</Typography>
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
              {/*
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
                  
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

                  {/*<IconButton type="button" onClick={handleSend}>
                    <SendIcon />
                  </IconButton>}
                </Paper>
              </Box>{" "}*/}
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
              {/* <ChatActionsSidebar />*/}
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
