import * as React from "react";
import {
  Toolbar,
  AppBar,
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  Divider,
  Stack,
} from "@mui/material";
import { Link } from "react-router";
import { useState } from "react";
import NavBarLinks from "./NavLinks";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../../assets/logo/svg/logo-no-background.svg";

function NavBar() {
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  function handleDrawerToggle() {
    setNavDrawerOpen(!navDrawerOpen);
  }
  return (
    <AppBar
      sx={{
        width: "100%",
        position: "sticky",
        backgroundColor: "black",
        color: "white",
        alignItems: "center",
      }}
    >
      <Toolbar
        disableGutters
        sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}
      >
        <Button
          color="inherit"
          component={Link}
          to="/"
          sx={{
            "&.MuiButton-root": {
              color: "white",
              "&:hover": {
                color: "red",
              },
            },
          }}
        >
          <img src={logo} alt="LivEcho Logo" style={{ height: 50 }} />
        </Button>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          <NavBarLinks />
        </Box>
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="right"
          open={navDrawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 250,
              backgroundColor: "black",
              color: "white",
              paddingTop: "2rem",
            },
          }}
        >
          <Stack spacing={3}>
            <Toolbar sx={{ justifyContent: "center" }}>
              <img src={logo} alt="LivEcho Logo" style={{ height: 50 }} />
            </Toolbar>
            <Divider sx={{ marginLeft: "5rem", backgroundColor: "white" }} />
            <Stack spacing={2}>
              <NavBarLinks />
            </Stack>
          </Stack>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
export default NavBar;
