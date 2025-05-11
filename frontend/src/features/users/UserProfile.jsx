import { useContext,useEffect, useState } from "react";
import { useParams } from "react-router";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import userUtils from "./userUtils";
import postUtils from "../posts/postUtils";
import { AuthContext } from "../../contexts/AuthContext";
import {
  Box,
  Button,
  Typography,
  Card,
  Paper,
  CardHeader,
  CardContent,
  useTheme,
  Tabs,
  Tab,
  Grid,
  CardActionArea,
  Link
} from "@mui/material";
import defaultBanner from "../../assets/landing/landing1.jpg";
import Profile from "../../components/Profile";
export default function UserProfile() {
  const theme = useTheme();
  const { userUID } = useParams();
  const { user : currUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [posts, setPosts] = useState([]);
  const [tab,setTab] = useState(0);
  const [mutualFriend, setMutualFriend] = useState(false);
  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };
  useEffect(() => {
    async function fetchUser() {
      try {
        setError(null);
        const user = await userUtils.fetchUserByUID(userUID);
        setUser(user);
        console.log("user",user)
        if(currUser.friends.some(friend => friend._id == user._id)){
          setIsFriend(true);
        }
        else{
          setIsFriend(false)
          console.log(currUser.friends)
        }
        const userPosts = await postUtils.getPostsByUID(userUID);
        setPosts(userPosts)
        const mutualFriends = (await postUtils.getMutualFriends()) || [];
        const isMutualFriend = mutualFriends.includes(userUID);
        setMutualFriend(isMutualFriend);
        setLoading(false);
      } catch (e) {
        setError(e);
      }
    }
    fetchUser();
  }, []);
 async function onClickAddFriend() {
    if(isFriend){
      try{
        console.log("Step 1")
        await userUtils.addFriendwithUID(userUID,isFriend)
        setIsFriend(false)
      }
      catch (e){
        setError(e)
      }
    }
    else{
      try{
        console.log("Step 1")
        await userUtils.addFriendwithUID(userUID,isFriend)
        setIsFriend(true)
      }
      catch (e){
        setError(e)
      }
    }

  }
  if (loading) {
    return <Loading />;
  } else if (error) {
    return <ErrorPage message={error} />;
  } else {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 4rem)",
          width: "100vw",
        }}
      >
        <Box
          sx={{
            height: "35vh",
            width: "100vw",
            backgroundImage: `url(${user.banner?.secure_url || defaultBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: -60,
              display: "flex",
            }}
          >
            <Profile
              sx={{
                width: "20vh",
                height: "20vh",
                fontSize: "8vh",
                boxShadow: "1px 1px 10px 1px black",
              }}
              user={user}
            />
          </Box>
        </Box>
        <Paper
          sx={{
            backgroundColor: theme.palette.background.default,
            flex: 1,
            padding: "4rem",
            justifyContent: "center",
            marginTop: "2em",
          }}
        >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          centered
          sx={{ mt: 10 }}
        >
          <Tab label="About" />
          <Tab label="Posts" />
        </Tabs>
          <Typography variant="h3" textAlign="center" mx={"2rem"}>
            {user.name}
          </Typography>

        
          <Box textAlign="center" mt={2}>
             <Button
              variant="contained"
              onClick={onClickAddFriend}> 
                {isFriend ? "Remove Friend" : "Add Friend"}
             </Button>
          </Box>
          {tab === 0 && (<Box sx={{ p: 2 }}>
          <Card
            sx={{
              marginTop: "2rem",
              mx: "auto",
              width: "60%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <CardHeader title="Bio" />
            </Box>
            <CardContent>
              {user.bio || "User hasn't added a bio..."}
            </CardContent>
          </Card>
          <Card
            sx={{
              marginTop: "2rem",
              mx: "auto",
              width: "60%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <CardHeader title="Account Info" />
            </Box>
            <CardContent>Name: {user.name}</CardContent>

            <CardContent>Username: {user.username}</CardContent>
            <CardContent>Email: {user.email}</CardContent>
          </Card>
          </Box>)}
           {tab === 1 && posts.length > 0 && (
                     <Grid container spacing={3} justifyContent="center" direction={"column"}>
                          {mutualFriend && (
                            posts.map((post) => (
                                  <Box key={post._id} sx={{ mb: 2 }}>
                                    <Paper elevation={3} sx={{ maxWidth: "800px", mx: "auto", p: 1 }}>
                                      <Card elevation={1}>
                                        <CardActionArea component={Link} to={`/posts/${post._id}`}>
                                        <CardHeader title={post.senderUsername} subheader={post.senderName} />
                                        <CardContent>
                                          <Typography variant="body1" gutterBottom>
                                            {post.text}
                                          </Typography>
                                          <Typography variant="caption" display="block" color="text.secondary">
                                            Posted on {new Date(post.createdAt).toLocaleString()}
                                          </Typography>
                                          {post.attachments && post.attachments.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                              <Typography variant="subtitle1">Attachments:</Typography>
                                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                                                {post.attachments.map((attachment) =>
                                                  attachment.resource_type === "image" ? (
                                                    <Box key={attachment._id} sx={{ maxWidth: "100%" }}>
                                                      <img
                                                        src={attachment.secure_url}
                                                        alt="attachment"
                                                        style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }}
                                                      />
                                                    </Box>
                                                  ) : null
                                                )}
                                              </Box>
                                            </Box>
                                            )}
                                          {post.isPrivate && (
                                            <Typography variant="caption" color="warning.main">
                                              Private Post
                                            </Typography>
                                          )}
                                        </CardContent>
                                        </CardActionArea>
                                      </Card>
                                    </Paper>
                                    
                                  </Box>
                            )))}

                            {!mutualFriend && (
                            posts.map((post) => (
                              !post.isPrivate && (
                                  <Box key={post._id} sx={{ mb: 2 }}>
                                    <Paper elevation={3} sx={{ maxWidth: "800px", mx: "auto", p: 1 }}>
                                      <Card elevation={1}>
                                        <CardActionArea component={Link} to={`/posts/${post._id}`}>
                                        <CardHeader title={post.senderUsername} subheader={post.senderName} />
                                        <CardContent>
                                          <Typography variant="body1" gutterBottom>
                                            {post.text}
                                          </Typography>
                                          <Typography variant="caption" display="block" color="text.secondary">
                                            Posted on {new Date(post.createdAt).toLocaleString()}
                                          </Typography>
                                          {post.attachments && post.attachments.length > 0 && (
                                            <Box sx={{ mt: 2 }}>
                                              <Typography variant="subtitle1">Attachments:</Typography>
                                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                                                {post.attachments.map((attachment) =>
                                                  attachment.resource_type === "image" ? (
                                                    <Box key={attachment._id} sx={{ maxWidth: "100%" }}>
                                                      <img
                                                        src={attachment.secure_url}
                                                        alt="attachment"
                                                        style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "8px" }}
                                                      />
                                                    </Box>
                                                  ) : null
                                                )}
                                              </Box>
                                            </Box>
                                            )}
                                        </CardContent>
                                        </CardActionArea>
                                      </Card>
                                    </Paper>
                                    
                                  </Box>
                            ))))}
                          </Grid>
                  )}
                  {tab === 1 && posts.length === 0 &&(
                     <Typography
                     variant="h3"
                     textAlign="center"
                     mx={"2rem"}
                   >Sorry {user.username} Has No Posts</Typography>
                  )}
                  {tab === 1 && !mutualFriend && posts.filter(post => !post.isPrivate).length === 0 &&(
                     <Typography
                     variant="h3"
                     textAlign="center"
                     mx={"2rem"}
                   >Sorry {user.username} Has No Posts</Typography>
                  )}

        </Paper>
      </Box>
    );
  }
}
