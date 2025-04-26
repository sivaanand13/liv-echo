import { Avatar } from "@mui/material";
import ColorHash from "color-hash";
const colorHsh = new ColorHash();
export default function Profile({ sx, user, Icon }) {
  console.log("Profile for user: ", user);
  const extractInitials = () => {
    let name = user.displayName || user.name;
    if (!name) {
      return "??";
    }
    return name
      .split(" ")
      .map((word) => word[0])
      .join("");
  };
  return (
    <Avatar
      src={user.profile?.secure_url}
      alt={user?.name}
      sx={{
        bgcolor: colorHsh.hex(user.displayName || user.name || user.username),
        color: "#fffff",
        ...sx,
      }}
    >
      {!user.profile?.url && extractInitials()}
    </Avatar>
  );
}
