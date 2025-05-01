import PaginatedList from "../../components/PaginatedList.jsx";
import { Box } from "@mui/material";
import userUtils from "./userUtils.js";
import UserCard from "./UserCard.jsx";
import searchBg from "../../assets/users/search.jpg";
export default function UserSearch() {
  return (
    <Box
      sx={{
        backgroundImage: `url(${searchBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "auto",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      {" "}
      <PaginatedList
        title="Search users"
        type="users"
        dataSource={userUtils.fetchUsers}
        ListItemComponent={UserCard}
        enableSearch={true}
      />
    </Box>
  );
}
