import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import {
  Card,
  Box,
  CardHeader,
  Paper,
  IconButton,
  Dialog,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import defaultBanner from "../../assets/landing/landing1.jpg";
import Profile from "../../components/Profile";
import EditIcon from "@mui/icons-material/Edit";
import EditAccount from "./EditAccount";
import EditBanner from "./EditBanner";
import EditProfile from "./EditProfile";

export default function Account() {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [openEditAccount, setOpenEditAccount] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openEditBanner, setOpenEditBanner] = useState(false);

  function closeModals() {
    setOpenEditAccount(false);
    setOpenEditBanner(false);
    setOpenEditProfile(false);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 4rem)",
      }}
    >
      <Box
        sx={{
          height: "30vh",
          width: "100vw",
          backgroundImage: `url(${user.banner?.secure_url || defaultBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <IconButton
          onClick={() => setOpenEditBanner(true)}
          sx={{
            position: "absolute",
            top: 1,
            right: 1,
            marginRight: "1em",
            marginTop: "1em",
            backgroundColor: "rgba(255,255,255,0.5)",
            "&:hover": { backgroundColor: "rgba(200,255,200,1)" },
          }}
        >
          <EditIcon fontSize="medium" />
        </IconButton>

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
              fontSize: "4vh",
              boxShadow: "1px 1px 10px 1px black",
            }}
            user={user}
          />
          <IconButton
            onClick={() => setOpenEditProfile(true)}
            sx={{
              position: "absolute",
              bottom: 1,
              right: 1,
              marginRight: "1em",
              marginBottom: "1em",
              backgroundColor: "rgba(255,255,255,0.5)",
              "&:hover": { backgroundColor: "rgba(200,255,200,1)" },
            }}
          >
            <EditIcon fontSize={"small"} />
          </IconButton>
        </Box>
      </Box>
      <Paper
        sx={{
          backgroundColor: theme.palette.background.default,
          flex: 1,
          padding: "4rem",
        }}
      >
        <Typography
          variant="h3"
          textAlign="center"
        >{`Welcome, ${user.name}!`}</Typography>
        <Box>
          <Typography>{user.bio}</Typography>
        </Box>

        <Button onClick={() => setOpenEditAccount(!openEditAccount)}>
          Edit Account
        </Button>
      </Paper>

      {openEditAccount && (
        <Dialog open={openEditAccount} onClose={closeModals}>
          {" "}
          <EditAccount handleClose={closeModals} />
        </Dialog>
      )}

      {openEditBanner && (
        <Dialog open={openEditBanner} onClose={closeModals}>
          {" "}
          <EditBanner handleClose={closeModals} />
        </Dialog>
      )}

      {openEditProfile && (
        <Dialog open={openEditProfile} onClose={closeModals}>
          {" "}
          <EditProfile handleClose={closeModals} />
        </Dialog>
      )}
    </Box>
  );
}
