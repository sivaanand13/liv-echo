import Profile from "./Profile";
import {
  ListItem,
  Typography,
  ListItemAvatar,
  ListItemText,
  Stack,
} from "@mui/material";
import { AdminPanelSettingsSharp } from "@mui/icons-material";
export default function UserListItem({ user, admin }) {
  return (
    <Stack direction="row" alignItems="center">
      <ListItemAvatar>
        <Profile user={user} />
      </ListItemAvatar>
      <ListItemText
        disableTypography={true}
        primary={
          <Stack direction="row" spacing={1}>
            {admin && (
              <AdminPanelSettingsSharp
                fontSize="small"
                sx={{ color: "primary.main" }}
              />
            )}{" "}
            <Typography> {user?.name || "Name not avaliable"} </Typography>{" "}
          </Stack>
        }
        secondary={
          <Stack direction={"column"}>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "text.primary", display: "inline" }}
            >
              {user.username || "Username not avaliable"}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "text.primary", display: "inline" }}
            >
              {user.email || "Email not avaliable"}
            </Typography>
          </Stack>
        }
      />
    </Stack>
  );
}
