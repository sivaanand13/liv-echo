import { Box, Typography, Link as LinkM } from "@mui/material";
import { Link } from "react-router";
function CustomLink({ to, children, color, hoverColor, sx }) {
  return (
    <LinkM
      component={Link}
      to={to}
      sx={{
        color: color || "#FF0000",
        "&:hover": {
          color: hoverColor || "#0F03FF",
        },
        ...sx,
      }}
    >
      {children}
    </LinkM>
  );
}

export default CustomLink;
