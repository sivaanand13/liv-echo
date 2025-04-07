import { Link } from "react-router";
import { Box, List, ListItem, Stack, Typography } from "@mui/material";
import landing1 from "../../assets/landing/landing1.jpg";
import CustomLink from "../../components/CustomLink";
function Landing() {
  const homePageData = [
    {
      title: "Welcome to LivEcho!",
      img: landing1,
    },
  ];
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        scrollSnapType: "y mandatory",
        overflowY: "scroll",
      }}
    >
      {homePageData.map((content, index) => {
        console.log(content);
        return (
          <Box
            sx={{
              scrollSnapAlign: "start",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              backgroundImage: `url(${content.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100vh",
              display: "flex",
              color: "white",
            }}
          >
            <Box>
              <Box
                sx={{
                  backdropFilter: "blur(1em)",
                  borderRadius: "2em",
                  padding: "1em",
                }}
              >
                <Stack spacing={3}>
                  {content.title ? (
                    content.to ? (
                      <CustomLink
                        to={content.to}
                        color="blue"
                        hoverColor={"#FF0000"}
                      >
                        {" "}
                        <Typography variant="h1">
                          {content.title}
                        </Typography>{" "}
                      </CustomLink>
                    ) : (
                      <Typography variant="h1">{content.title}</Typography>
                    )
                  ) : (
                    ""
                  )}
                  {content.text}
                </Stack>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default Landing;
