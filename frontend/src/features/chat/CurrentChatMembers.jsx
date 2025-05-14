import { ListItem } from "@mui/material";
import CustomList from "../../components/CustomList";
import chatStore from "../../stores/chatStore";
import UserListItem from "../../components/UserListItem";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
export default function CurrentChatMembers() {
  const { currentChat } = chatStore();
  const admins = currentChat.admins.map((admin) => admin.uid);
  return (
    <CustomList
      listData={currentChat.members}
      mappingFunction={(member) => {
        // console.log(member);
        return (
          <ListItem>
            <UserListItem user={member} admin={admins.includes(member.uid)} />
          </ListItem>
        );
      }}
    />
  );
}
