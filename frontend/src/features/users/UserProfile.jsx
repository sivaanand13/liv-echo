import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import Loading from "../../components/Loading";
import ErrorPage from "../../components/ErrorPage";
import userUtils from "./userUtils";
import {
  Box,
  Typography,
  Card,
  Paper,
  CardHeader,
  CardContent,
  useTheme,
} from "@mui/material";
import defaultBanner from "../../assets/landing/landing1.jpg";
import Profile from "../../components/Profile";
import { AuthContext } from "../../contexts/AuthContext";
export default function UserProfile() {
  let { user: currentUser } = useContext(AuthContext);
  const theme = useTheme();
  const { userUID } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setError(null);
        const user = await userUtils.fetchUserByUID(userUID);
        setUser(user);
        setLoading(false);
      } catch (e) {
        setError(e);
      }
    }
    fetchUser();
  }, []);
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
            minHeight: "35vh",
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
          <Typography variant="h3" textAlign="center" mx={"2rem"}>
            {user.name}
          </Typography>

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
        </Paper>
      </Box>
    );
  }
}
