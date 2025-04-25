import defaultBanner from "../../assets/landing/landing1.jpg";
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
} from "@mui/material";
export default function UserCard({ item: user }) {
  console.log("user card:", user);

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
        title={<Typography variant="h4">{user.name}</Typography>}
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
    </Card>
  );
}
