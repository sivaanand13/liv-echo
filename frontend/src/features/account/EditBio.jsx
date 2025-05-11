import { Dialog, Input } from "@mui/material";
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
import { AuthContext } from "../../contexts/AuthContext";
import accountUtils from "./accountUtils";

export default function EditBio({ handleClose }) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [bio, setBio] = useState("");
  const [error, setError] = useState(null);

  const [image, setImage] = useState(null);

  function fillInFields() {
    setBio(user.bio || "");
    setImage(null);
  }

  useEffect(() => {
    fillInFields();
  }, []);

  function handleCancel() {
    handleClose();
    fillInFields();
    setError(null);
  }

  async function handleEdit(e) {
    e.preventDefault();

    setError("");

    let curBio = bio;

    try {
      console.log("calling EditBio");

      await accountUtils.editBio(curBio);
      handleCancel();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <Card
      sx={{
        padding: "2rem",
        backgroundColor: theme.palette.background.default,
        justifyContent: "center",
        alignItems: "center",
        minWidth: "50vw",
      }}
    >
      <Stack spacing={2} width="100%">
        <Typography textAlign="center" variant="h4" sx={{ width: "100%" }}>
          Update Biography
        </Typography>

        <FormControl>
          <FormLabel htmlFor="bio">Enter Bio:</FormLabel>
          <TextField
            rows={5}
            multiline
            required
            name="bio"
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </FormControl>
        {error && <Typography color="error">{error}</Typography>}
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
            Update
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
