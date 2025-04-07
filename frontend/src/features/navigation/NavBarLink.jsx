import * as React from "react";
import { Toolbar, AppBar, Box, Typography, Button, Icon } from "@mui/material";
import { Link } from "react-router";

function NavBarLink({ to, children }) {
  return (
    <Button
      className="nav-bar-link"
      color="inherit"
      component={Link}
      to={to}
      sx={{
        "&.MuiButton-root": {
          color: "white",
          "&:hover": {
            color: "red",
          },
        },
      }}
    >
      {children}
    </Button>
  );
}
export default NavBarLink;
