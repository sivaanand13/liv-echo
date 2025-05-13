import defaultBanner from "../../assets/landing/landing1.jpg";
import CustomLink from "../../components/CustomLink";
import KeyValDisplay from "../../components/KeyValDisplay";
import Profile from "../../components/Profile";
import {
  Card,
  CardMedia,
  Box,
  Typography,
  CardContent,
  CardHeader,
  Stack,
  Button,
  CardActions,
} from "@mui/material";
import accountUtils from "./accountUtils";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export default function FriendCard({ item: user, type }) {
  const { refreshAccount } = useContext(AuthContext);
  async function handleResolveFriendRequest(type) {
    try {
      console.log("resolve friend request with: ", type, user.uid);
      await accountUtils.resolveFriendRequest(user.uid, type);
      refreshAccount();
    } catch (e) {
      alert("Friend request resolution failed!");
    }
  }

  async function handleRemoveFriend() {
    try {
      await accountUtils.removeFriend(user.uid);
      refreshAccount();
    } catch (e) {
      console.log(e);
      alert("Friend removal failed!");
    }
  }

  return (
    <Card
      sx={{
        width: "100%",
        minWidth: "33vw",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      {" "}
      <Box
        sx={{
          height: "15vh",
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
              width: "12vh",
              height: "12vh",
              fontSize: "6vh",
              boxShadow: "1px 1px 10px 1px black",
            }}
            user={user}
          />
        </Box>
      </Box>
      <CardHeader
        sx={{ marginTop: "5vh" }}
        title={
          <Typography variant="h4">
            <CustomLink to={`/users/${user.uid}`}>{user.name}</CustomLink>
          </Typography>
        }
      />
      <CardContent
        sx={{ paddingLeft: "2em", paddingRight: "2em", textAlign: "left" }}
      >
        <Stack spacing={3}>
          <KeyValDisplay
            label="Username"
            sx={{ color: "text.secondary" }}
            value={user.username}
          />
          <KeyValDisplay
            label="Email"
            sx={{ color: "text.secondary" }}
            value={user.email}
          />
        </Stack>
      </CardContent>
      {type == "friendRequests" ? (
        <Box display="flex" justifyContent="center" gap={2} margin="1em">
          <Button
            sx={{ flex: 1 }}
            variant="contained"
            color="secondary"
            onClick={() => handleResolveFriendRequest(-1)}
          >
            Reject
          </Button>
          <Button
            sx={{ flex: 1 }}
            variant="contained"
            color="primary"
            onClick={() => handleResolveFriendRequest(1)}
          >
            Accept
          </Button>
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" gap={2} margin="1em">
          <Button
            sx={{ flex: 1 }}
            variant="contained"
            color="primary"
            onClick={() => handleRemoveFriend()}
          >
            Remove
          </Button>
        </Box>
      )}
    </Card>
  );
}
