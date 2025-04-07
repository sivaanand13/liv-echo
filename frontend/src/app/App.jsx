import { useState } from "react";
import NavBar from "../features/navigation/NavBar";
import AppRoutes from "../routes/AppRoutes";
import { Container, Box } from "@mui/material";
import { AuthProvider } from "../contexts/AuthContext";
function App() {
  const [count, setCount] = useState(0);

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
      <AuthProvider>
        <NavBar />
        <Box
          sx={{
            flexGrow: 1,
            margin: 0,
            padding: 0,
          }}
        >
          <AppRoutes />
        </Box>
      </AuthProvider>
    </Box>
  );
}

export default App;
