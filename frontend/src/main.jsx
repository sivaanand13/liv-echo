import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { BrowserRouter } from "react-router";
import firebaseConfig from "./firebase/config.js";
import { initializeApp } from "firebase/app";
import theme from "./theme/themeConfig.js";
import { ThemeProvider } from "@mui/material";
initializeApp(firebaseConfig);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
