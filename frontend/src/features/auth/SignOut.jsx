import { useNavigate } from "react-router";
import firebaseUtils from "../../firebase/utils.js";
import { Button } from "@mui/material";
const SignOutButton = () => {
  const navigate = useNavigate();
  return (
    <Button
      className="nav-bar-link"
      color="inherit"
      onClick={async () => {
        navigate("/signin");
        await firebaseUtils.signOutFirebaseUser();
      }}
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
