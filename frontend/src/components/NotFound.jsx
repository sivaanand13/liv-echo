import { Container, Typography, Box, CardMedia } from "@mui/material";
import notFoundImage from "../assets/errors/not_found.svg";
import bgImg from "../assets/landing/landing1.jpg";

function NotFound({ message }) {
  return (
    <Box
      sx={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "auto",
        backgroundAttachment: "fixed",
        placeItems: "center",
        display: "flex",
        justifyContent: "center",
        height: "calc(100vh - 4rem)",
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
          image={notFoundImage}
          alt={"404 Not Found Icon"}
          sx={{
            height: "40vh",
            margin: "auto",
            padding: "1em",
            objectFit: "contain",
          }}
        />

        <Typography variant="body1" sx={{ marginBottom: "2rem" }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
}

export default NotFound;
