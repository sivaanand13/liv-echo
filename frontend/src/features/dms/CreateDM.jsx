import {
  MenuItem,
  Select,
  Typography,
  Card,
  FormControl,
  Stack,
  TextField,
  FormLabel,
  useTheme,
  CardActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import UserListItem from "../../components/UserListItem";
import dmUtils from "./dmUtils";
export default function CreateDM({ handleCloseModal }) {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);

  function handleCancel() {
    setSearch("");
    setSearchUsers([]);
    setSelectedUser(null);
    setError(null);
    setSearchError(null);
    handleCloseModal();
  }

  async function handleSearch(query) {
    setSearchError(null);
    setSearch(query);
    setSearchUsers([]);
    query = query.trim();
    if (query == "") {
      setSearchError("Search query cannot be empty");
      return;
    }
    try {
      const users = await dmUtils.getAvaliableDMUsers(query);
      if (!users || users.length == 0) {
        setSearchError("No users for query term");
      }
      setSearchUsers(users);
    } catch (e) {
      setSearchError("Error for search term");
    }
  }

  async function handleCreateDM(e) {
    e.preventDefault();
    let user = selectedUser;
    if (user == null) {
      setError("Please select user");
      return;
    }

    try {
      const chat = await dmUtils.createDM(user);
      console.log(chat);
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
          Create Direct Message
        </Typography>

        <FormControl>
          <FormLabel htmlFor="search">Search Users</FormLabel>
          <TextField
            id="search"
            type="text"
            name="search"
            placeholder="Name, Username, or Email"
            error={searchError != null}
            helperText={searchError}
            autoFocus
            required
            fullWidth
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {searchUsers && searchUsers.length != 0 && (
          <FormControl>
            <FormLabel htmlFor="selectUser">Select User</FormLabel>
            <Select
              id="selectUser"
              name="selectUser"
              value={selectedUser}
              renderValue={(selectedUserId) => {
                const user = searchUsers.find(
                  (val) => val.uid == selectedUserId
                );
                return <UserListItem user={user} />;
              }}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {searchUsers.map((user) => {
                return (
                  <MenuItem key={user.uid} value={user.uid}>
                    <UserListItem user={user} />
                  </MenuItem>
                );
              })}
            </Select>
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
            onClick={handleCreateDM}
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
