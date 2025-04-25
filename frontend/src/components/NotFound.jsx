import { Container, Typography, Box, CardMedia } from "@mui/material";
function NotFound({ message }) {
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
          <strong>Page Not Found </strong>
        </Typography>
        <CardMedia
          component="img"
          image={"/not_found.svg"}
          alt={"404 Not Found Icon"}
          sx={{
            width: "40%",
            margin: "auto",
            padding: "1em",
            objectFit: "contain",
          }}
        />

        <Typography variant="body1" sx={{ marginBottom: "2rem" }}>
          {message}
        </Typography>
      </Box>
    </Container>
  );
}

export default NotFound;
