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
      secondary: "#1e88e5",
      disabled: "rgba(100,100,100,0.4)",
    },
    info: {
      main: "#2196f3",
      light: "#6ec6ff",
      dark: "#0069c0",
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
