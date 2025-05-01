import { Container, Typography, Box } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
function ErrorPage({ title, message }) {
  return (
    <Container
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          minWidth: "70%",
          maxWidth: "80%",

          borderRadius: "1em",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(0.5em)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h2" sx={{ margin: "1rem" }}>
          <strong>{title || "Error"}</strong>
        </Typography>
        <ErrorIcon sx={{ fontSize: "20vw", color: "red" }} />

        <Typography variant="body1" sx={{ marginBottom: "2rem" }}>
          {message}
        </Typography>
      </Box>
    </Container>
  );
}

export default ErrorPage;
