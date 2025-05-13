import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import PostCard from "./PostCard";
import { Link, useNavigate } from "react-router-dom";
import searchBg from "../../assets/users/search.jpg";
import postUtils from "./postUtils"; // or wherever getPosts is defined
import { AuthContext } from "../../contexts/AuthContext.jsx";
import userUtils from "../users/userUtils.js";
import StaticPaginatedList from "../../components/StaticPaginatedList.jsx";
import { Co2Sharp } from "@mui/icons-material";
import { post } from "../../utils/requests/axios.js";
import { formatDistanceToNow } from "date-fns";
import { useNotification } from "../../contexts/NotificationContext.jsx";

export default function MostCommentedFeed() {
  const { currentUser, serverUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [mutualFriend, setMutualFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState(0);
  const [displayData, setDisplayData] = useState(null);
  const [displayTitle, setDisplayTitle] = useState("");

  const { notifications } = useNotification();
  console.log("notifications", notifications);
  function handleTabChange(_, newTab) {
    console.log("Handling tab change: ", newTab);
    setTab(newTab);
    let data;
    switch (newTab) {
      case 0:
        setDisplayTitle("Most Liked Posts");
        data = sortByLikes();
        break;
      case 1:
        setDisplayTitle("Most Commented Posts");
        data = sortByComments();
        break;
      case 2:
        setDisplayTitle("Friends' Posts");
        data = sortByMutualFriendsPosts();
        break;
    }
    console.log("sorted: ", data);
    setDisplayData(data);
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await postUtils.getPosts();
        const mutualFriends = (await postUtils.getMutualFriends()) || []; //returns list of uids as friends
        setMutualFriends(mutualFriends);
        console.log("I got friends!", mutualFriends);
        console.log("AP", allPosts);
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
        setTab(0);
      } catch (err) {
        console.error(err);
        setError("Could not load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser, notifications]);

  useEffect(() => {
    console.log("Posts updated");
    handleTabChange(null, tab);
  }, [posts, tab]);

  const sortByComments = () => {
    return [...posts].sort(
      (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
    );
  };

  // Sort posts by the number of likes
  const sortByLikes = () => {
    return [...posts].sort(
      (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
    );
  };

  // Sort posts by the number of friends of the sender
  const sortByMutualFriendsPosts = () => {
    return [...posts].filter((post) => {
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "2em",
        }}
      >
        <Tabs
          centered
          sx={{
            width: "fit-content",
            backgroundColor: "white",
            padding: 2,
            display: "flex",
            borderRadius: "0.5em",
          }}
          value={tab}
          onChange={handleTabChange}
        >
          <Tab label="Most Liked" />
          <Tab label="Most Commented" />
          <Tab label="Friends' Posts" />
        </Tabs>
      </Box>

      <Box>
        {loading && (
          <CircularProgress sx={{ display: "block", margin: "0 auto" }} />
        )}
        {error && <Typography color="error">{error}</Typography>}

        {displayData?.length > 0 && (
          <StaticPaginatedList
            title={displayTitle}
            type="posts"
            sourceData={displayData}
            ListItemComponent={PostCard}
            enableSearch={false}
            PAGE_SIZE={10}
          />
        )}
      </Box>
    </Box>
  );
}
