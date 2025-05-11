import React, { useEffect, useState, useContext } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import PostCard from "./PostCard";
import { Link } from "react-router-dom";
import searchBg from "../../assets/users/search.jpg";
import postUtils from "./postUtils"; // or wherever getPosts is defined
import { AuthContext } from "../../contexts/AuthContext.jsx";
import userUtils from "../users/userUtils.js";

export default function MostCommentedFeed() {
  const { currentUser, serverUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
   const [mutualFriend, setMutualFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await postUtils.getPosts();
        const mutualFriends = (await postUtils.getMutualFriends()) || []; //returns list of uids as friends
        setMutualFriends(mutualFriends);
        console.log("I got friends!", mutualFriends);
        const filteredPosts = (
          await Promise.all(
            allPosts.map(async (post) => {
              const isPublic = post.isPrivate === false;
              const senderId = post.sender.uid;
              // console.log("SenderId", senderId)
              const isMutualFriend = mutualFriends.includes(senderId);
              // console.log("Mutual friend", isMutualFriend);
              // console.log("Data of post", post.text);
              let isMe = false;
              if (senderId === currentUser.uid) {
                isMe = true;
              }
              return isPublic || isMe || isMutualFriend ? post : null;
            })
          )
        ).filter(Boolean); // remove nulls
        console.log("I got these posts as possible", filteredPosts);
        setPosts(filteredPosts);
      } catch (err) {
        console.error(err);
        setError("Could not load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser.uid]);
   const sortByComments = () => {
    return posts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
  };

  // Sort posts by the number of likes
  const sortByLikes = () => {
    return posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  };

  // Sort posts by the number of friends of the sender
  const sortByMutualFriendsPosts = () => {
    return posts.filter(post => {
      return post.sender && mutualFriend.includes(post.sender.uid); // Only posts by mutual friends
    });
  };
  return (
    <Box
      sx={{
        backgroundImage: `url(${searchBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Typography
        variant="h4"
        sx={{ color: "white", marginBottom: "20px", textAlign: "center" }}
      >
        Most Commented Posts
      </Typography>

      {loading && (
        <CircularProgress sx={{ display: "block", margin: "0 auto" }} />
      )}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={3} justifyContent="center">
        {sortByComments().map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Link to={`/posts/${post._id}`} style={{ textDecoration: "none" }}>
              <PostCard item={post} />
            </Link>
          </Grid>
        ))}
      </Grid>
      <Typography
        variant="h4"
        sx={{ color: "white", marginBottom: "20px", textAlign: "center" }}
      >
        Most Liked Posts
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {sortByLikes().map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Link to={`/posts/${post._id}`} style={{ textDecoration: "none" }}>
              <PostCard item={post} />
            </Link>
          </Grid>
        ))}
      </Grid>

      <Typography
        variant="h4"
        sx={{ color: "white", marginBottom: "20px", textAlign: "center" }}
      >
        Friends Posts
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {sortByMutualFriendsPosts().map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <Link to={`/posts/${post._id}`} style={{ textDecoration: "none" }}>
              <PostCard item={post} />
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
