import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function EditButton({ onClick, sx }) {
  return (
    <IconButton
      onClick={() => onClick()}
      sx={{
        top: 1,
        right: 1,
        height: "2em",
        width: "2em",
        "&:hover": { backgroundColor: "rgba(150,150,150,0.5)" },
        ...sx,
      }}
    >
      <EditIcon fontSize="medium" />
    </IconButton>
  );
}
