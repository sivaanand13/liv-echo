import { Avatar } from "@mui/material";

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
    <Avatar src={user.profile?.url} alt={user?.name}>
      {!user.profile?.url && extractInitials()}
    </Avatar>
  );
}
