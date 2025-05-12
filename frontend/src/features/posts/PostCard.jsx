import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  ListItemAvatar,
  CardActionArea,
  Box,
  useTheme,
  CardActions,
} from "@mui/material";
import Profile from "../../components/Profile";
import CustomLink from "../../components/CustomLink";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Link } from "react-router";
import CommentIcon from "@mui/icons-material/Comment";
export default function PostCard({ item: post }) {
  const theme = useTheme();
  console.log("display post:", post);
  if (!post) {
    return <div>No post data available</div>;
  }
  return (
    <Card
      sx={{
        width: "100%",
        padding: "1em",
        minWidth: "33vw",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <Stack
        direction="row"
        sx={{ paddingLeft: "1em", paddingRight: "2em", textAlign: "left" }}
      >
        <ListItemAvatar>
          <Profile user={post.sender} />
        </ListItemAvatar>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Typography variant="caption">
              <CustomLink
                to={`/users/${post.sender?.uid}`}
                sx={{
                  color: "purple",
                  textDecoration: "underline",

                  "&:hover": {
                    color: "red",
                    textDecoration: "none",
                  },
                }}
              >
                {post.sender?.name ||
                  post.sender?.username ||
                  post.senderName ||
                  post.senderUsername ||
                  "Unknown"}
              </CustomLink>
            </Typography>
          </Stack>
          <Typography variant="caption">
            {new Date(post.createdAt).toLocaleString()}
          </Typography>{" "}
        </Stack>
      </Stack>
      <CardHeader
        sx={{}}
        title={<Typography variant="h4">{post.text}</Typography>}
      />
      <Box sx={{ width: "100%" }}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack direction={"row"} spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FavoriteIcon color="error" />
              {post.likes?.length || 0}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CommentIcon color="info" />
              {post.comments?.length || 0}
            </Box>
          </Stack>
          <Link to={`/posts/${post._id}`}>see more</Link>
        </Stack>
      </Box>
    </Card>
  );
}
