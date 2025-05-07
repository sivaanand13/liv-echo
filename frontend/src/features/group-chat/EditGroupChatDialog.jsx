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
  CardActions,
  Button,
  ListItem,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import UserListItem from "../../components/UserListItem";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import groupChatUtils from "./groupChatUtils";
import { AuthContext } from "../../contexts/AuthContext";

export default function EditGroupChatDialog({ open, handleClose }) {
  const { serverUser } = useContext(AuthContext);
  const currentChat = chatStore((state) => state.currentChat);
  const theme = useTheme();
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const [currProfile, setCurProfile] = useState("");
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  function fillInFields() {
    setName(currentChat.name);
    const userMembers = currentChat.members.filter(
      (m) => m.uid !== serverUser?.uid
    );
    setMembers(userMembers);
    setCurProfile(currentChat.profile?.secure_url);
    setProfile("");
  }

  useEffect(() => {
    fillInFields();
    async function fetchAvaliableUsers() {
      try {
        const users = await groupChatUtils.getAvaliableUsers();
        setUsers(users);
      } catch (e) {
        setError(e);
      }
    }
    fetchAvaliableUsers();
  }, [currentChat, open]);

  function handleCancel() {
    handleClose();
    fillInFields();
    setError(null);
  }

  async function handleEdit(e) {
    e.preventDefault();

    setError("");
    let curName = name;
    let curMembers = members;
    let curProfile = profile;
    try {
      curName = groupChatUtils.validateChatName(curName);
      curMembers = curMembers.map((user) => user.uid);
      curMembers = groupChatUtils.validateMembers(curMembers);
    } catch (e) {
      setError(e);
      return;
    }

    try {
      console.log("call editChat with fields: ", curMembers, curName);

      const chat = await groupChatUtils.editGroupChat(
        currentChat,
        curName,
        curProfile,
        curMembers
      );
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
            <TextField
              id="name"
              type="text"
              name="name"
              label="Name"
              placeholder="Enter chat name"
              autoFocus
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <Box display="flex" justifyContent="center">
            <Avatar
              src={profile ? URL.createObjectURL(profile) : currProfile}
              sx={{ width: 100, height: 100 }}
            />
          </Box>
          <FormControl>
            <Button
              component="label"
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
            >
              Upload Profile
              <input
                accept="image/*"
                id="profile"
                name="profile"
                required={false}
                type="file"
                onChange={(e) => setProfile(e.target.files[0])}
                hidden={true}
              />
            </Button>
          </FormControl>
          {users && users.length != 0 && (
            <FormControl>
              <FormLabel htmlFor="members">Edit Members</FormLabel>
              <Autocomplete
                multiple
                options={users.filter(
                  (user) =>
                    !members.some((curMemer) => curMemer.uid == user.uid)
                )}
                getOptionLabel={(user) => user.username}
                value={members}
                onChange={(e, newMembers) => setMembers(newMembers)}
                renderOption={(props, user) => (
                  <ListItem {...props} key={user.uid}>
                    <UserListItem user={user} />
                  </ListItem>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Members"
                    placeholder="Search users"
                  />
                )}
              />
            </FormControl>
          )}
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
              onClick={handleEdit}
            >
              Edit
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
