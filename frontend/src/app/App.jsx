import { useEffect, useRef, useState } from "react";
import NavBar from "../features/navigation/NavBar";
import AppRoutes from "../routes/AppRoutes";
import { Container, Box } from "@mui/material";
import AuthProvider from "../contexts/AuthContext";
import CssBaseline from "@mui/material/CssBaseline";
function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        margin: "0",
        padding: "0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CssBaseline />
      <AuthProvider>
        <NavBar />
        <Box
          sx={{
            pt: "4rem",
            flexGrow: 1,
            margin: 0,
            padding: 0,
            flexGrow: 1,
            overflow: "auto",
          }}
        >
          <AppRoutes />
        </Box>
      </AuthProvider>
    </Box>
  );
}

export default App;
