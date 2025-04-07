import firebaseUtils from "../../firebase/utils.js";
import { Button } from "@mui/material";
const SignOutButton = () => {
  return (
    <Button
      className="nav-bar-link"
      color="inherit"
      onClick={firebaseUtils.signOutFirebaseUser}
      sx={{
        "&.MuiButton-root": {
          color: "white",
          "&:hover": {
            color: "red",
          },
        },
      }}
    >
      Sign Out
    </Button>
  );
};

export default SignOutButton;
