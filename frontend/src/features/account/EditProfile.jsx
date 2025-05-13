import { Dialog } from "@mui/material";
import chatStore from "../../stores/chatStore";
import {
  Typography,
  Card,
  Box,
  FormControl,
  Stack,
  useTheme,
  Avatar,
  CardActions,
  Button,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { AuthContext } from "../../contexts/AuthContext";
import defaultBanner from "../../assets/landing/landing1.jpg";
import accountUtils from "./accountUtils";

export default function EditProfile({ handleClose }) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [curImage, setCurImage] = useState("");
  const [error, setError] = useState(null);

  const [image, setImage] = useState(null);

  function fillInFields() {
    setCurImage(user.profile?.secure_url || defaultBanner);
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

    let selectedImage = image;

    try {
      console.log("call editBanner");

      const chat = await accountUtils.editProfile(selectedImage);
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
      }}
    >
      <Stack spacing={2} width="100%">
        <Typography textAlign="center" variant="h4" sx={{ width: "100%" }}>
          Update Profile
        </Typography>

        <Box display="flex" justifyContent="center">
          <Avatar
            src={image ? URL.createObjectURL(image) : curImage}
            sx={{ width: "25vh", height: "25vh" }}
            alt="Profile image"
          />
        </Box>
        <FormControl>
          <Box
            component="label"
            htmlFor="banner"
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: "1em",
              backgroundColor: theme.palette.secondary.main,
              color: "white",
              borderRadius: "0.5em",
              cursor: "pointer",
              textAlign: "center",
              gap: "1em",
            }}
          >
            <CloudUploadIcon />
            Upload Profile
            <input
              accept="image/*"
              id="banner"
              name="banner"
              required={true}
              type="file"
              onChange={(e) => {
                console.log(e);
                setImage(e.target.files[0]);
              }}
              hidden={true}
            />
          </Box>
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
