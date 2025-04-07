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
import logo from "../../assets/logo.png";

function NavBar() {
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  function handleDrawerToggle() {
    setNavDrawerOpen(!navDrawerOpen);
  }
  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
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
          <Typography variant="h4">LivEcho</Typography>
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
              <Typography variant="h4">SpaceX</Typography>
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
