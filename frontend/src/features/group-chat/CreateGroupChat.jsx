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
import { useEffect, useState } from "react";
import UserListItem from "../../components/UserListItem";
import groupChatUtils from "./groupChatUtils.js";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function CreateGroupChat({ handleCloseModal }) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAvaliableUsers() {
      try {
        const users = await groupChatUtils.getAvaliableUsers();
        // console.log("aval users:", users);
        setUsers(users);
      } catch (e) {
        setError(e);
      }
    }
    fetchAvaliableUsers();
  }, []);

  function handleCancel() {
    setError(null);
    handleCloseModal();
  }

  async function handleCreate(e) {
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
      // console.log("cur fields: ", curMembers, curName);

      const chat = await groupChatUtils.createGroupChat(
        curName,
        curProfile,
        curMembers
      );
      // console.log(chat);
      handleCloseModal();
    } catch (e) {
      setError(e);
    }
  }

  return (
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
        <Typography variant="h4" sx={{ width: "100%" }}>
          Create Group Chat
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
            src={profile ? URL.createObjectURL(profile) : ""}
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
              required="false"
              type="file"
              onChange={(e) => setProfile(e.target.files[0])}
              hidden={true}
            />
          </Button>
        </FormControl>
        {users && users.length != 0 && (
          <FormControl>
            <FormLabel htmlFor="members">Add Members</FormLabel>
            <Autocomplete
              multiple
              options={users}
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
            onClick={handleCreate}
          >
            Create
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
  );
}
