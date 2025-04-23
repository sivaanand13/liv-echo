import { Dialog } from "@mui/material";
import chatStore from "../../stores/chatStore";
import {
  Typography,
  Card,
  Box,
  FormControl,
  Stack,
  TextField,
  FormLabel,
  Autocomplete,
  useTheme,
  Avatar,
  Select,
  MenuItem,
  CardActions,
  Button,
  ListItem,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import UserListItem from "../../components/UserListItem";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import groupChatUtils from "./groupChatUtils";
import { AuthContext } from "../../contexts/AuthContext";
import validation from "../../utils/validation";

export default function ChangeAdminDialog({ open, handleClose }) {
  const { serverUser } = useContext(AuthContext);
  const currentChat = chatStore((state) => state.currentChat);
  const theme = useTheme();
  const [admin, setAdmin] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fillInFields();
  }, [serverUser, currentChat]);

  function fillInFields() {
    console.log(currentChat.members);
    const avalMembers = currentChat.members.filter(
      (user) => user.uid !== serverUser.uid
    );
    console.log("Aval members for admin access: ", avalMembers);
    setMembers(avalMembers);
    setAdmin("");
  }

  function handleCancel() {
    handleClose();
    fillInFields();
    setError(null);
  }

  async function handleChange(e) {
    e.preventDefault();

    setError("");
    let curAdmin = admin;
    try {
      curAdmin = validation.validateString(curAdmin, "Admin Id");
    } catch (e) {
      setError(e);
      return;
    }

    try {
      console.log("calling changeChat admin with new admin: ", curAdmin);

      const chat = await groupChatUtils.changeAdmin(currentChat, curAdmin);
      handleCancel();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <Dialog open={open} onClose={handleCancel}>
      <Card
        sx={{
          minWidth: "40vw",
          maxWidth: "50vw",
          padding: "2rem",
          backgroundColor: theme.palette.background.default,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack spacing={2} width="100%">
          <Typography textAlign="center" variant="h4" sx={{ width: "100%" }}>
            Update Group Chat
          </Typography>

          <FormControl>
            <FormLabel htmlFor="selectUser">Select Admin</FormLabel>
            <Select
              id="selectUser"
              name="selectUser"
              value={admin}
              renderValue={(selectedUserId) => {
                const user = members.find((val) => val.uid == selectedUserId);
                return <UserListItem user={user} />;
              }}
              onChange={(e) => setAdmin(e.target.value)}
            >
              {members.map((user) => {
                return (
                  <MenuItem key={user.uid} value={user.uid}>
                    <UserListItem user={user} />
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {error && <Typography>{error}</Typography>}
          <CardActions sx={{ display: "flex" }}>
            <Button
              size="large"
              type="submit"
              sx={{
                flexGrow: 1,
                borderRadius: "1em",
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
              onClick={handleChange}
            >
              Change
            </Button>
            <Button
              size="large"
              type="button"
              sx={{
                flexGrow: 1,
                borderRadius: "1em",
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.primary.contrastText,
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </CardActions>
        </Stack>
      </Card>
    </Dialog>
  );
}
