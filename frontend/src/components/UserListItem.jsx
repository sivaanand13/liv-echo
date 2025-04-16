import Profile from "./Profile";
import {
  ListItem,
  Typography,
  ListItemAvatar,
  ListItemText,
  Stack,
} from "@mui/material";

export default function UserListItem({ user }) {
  return (
    <Stack direction="row" alignItems="center">
      <ListItemAvatar>
        <Profile user={user} />
      </ListItemAvatar>
      <ListItemText
        disableTypography={true}
        primary={user?.name || "Name not avaliable"}
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
