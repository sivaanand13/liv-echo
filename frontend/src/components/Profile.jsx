import { Avatar } from "@mui/material";
import ColorHash from "color-hash";
const colorHsh = new ColorHash();
export default function Profile({ user }) {
  const extractInitials = () => {
    if (!user.name) {
      return "??";
    }
    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("");
  };
  return (
    <Avatar
      src={user.profile?.url}
      alt={user?.name}
      sx={{
        bgcolor: colorHsh.hex(user.name),
        color: "#fffff",
      }}
    >
      {!user.profile?.url && extractInitials()}
    </Avatar>
  );
}
