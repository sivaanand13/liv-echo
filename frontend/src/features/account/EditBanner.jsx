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
import { AuthContext } from "../../contexts/AuthContext";
import defaultBanner from "../../assets/landing/landing1.jpg";
import accountUtils from "./accountUtils";
import { CircularProgress } from "@mui/material";

export default function EditBanner({ handleClose }) {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [curImage, setCurImage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  function fillInFields() {
    setCurImage(user.banner?.secure_url || defaultBanner);
    setImage(null);
  }

  useEffect(() => {
    fillInFields();
  }, []);

  function handleCancel() {
    handleClose();
    fillInFields();
    setLoading(false);
    setError(null);
  }

  async function handleEdit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let selectedImage = image;

    try {
      const chat = await accountUtils.editBanner(selectedImage);
      handleCancel();
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(`Invalid Banner`);
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
        {loading ? (
          <Box sx={{ padding: "2em" }}>
            <CircularProgress size="5em" />
          </Box>
        ) : (
          <>
            <Typography textAlign="center" variant="h4" sx={{ width: "100%" }}>
              Update Banner
            </Typography>

            <Box display="flex" justifyContent="center">
              <Avatar
                src={image ? URL.createObjectURL(image) : curImage}
                sx={{ width: "25vh", height: "25vh" }}
                alt="Banner"
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
                Upload Banner
                <input
                  type="file"
                  id="banner"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    setImage(e.target.files[0]);
                  }}
                />
              </Box>
            </FormControl>
            {error && (
              <Typography color="red" textAlign="center">
                {error}
              </Typography>
            )}
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
          </>
        )}
      </Stack>
    </Card>
  );
}
