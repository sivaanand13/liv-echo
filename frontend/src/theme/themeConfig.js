import { createTheme } from "@mui/material";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#ff4500",
      light: "#ff7b26",
      dark: "#b22222",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#ff4500",
      light: "#ff7b26",
      dark: "#b22222",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAFAFA",
      paper: "#F8F8F8",
    },
    text: {
      primary: "#2c1a00",
      secondary: "#9c27b0",
      disabled: "rgba(100,100,100,0.4)",
    },
    info: {
      main: "#9c27b0",
      light: "#ba68c8",
      dark: "#7b1fa2",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#ffa000",
    },
    error: {
      main: "#d32f2f",
    },
  },
});

export default theme;
