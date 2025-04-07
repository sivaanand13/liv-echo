import { Box, Typography } from "@mui/material";

export default function Errors({ errors }) {
  return (
    <>
      {errors && Array.isArray(errors) && errors.length != 0
        ? errors.map((e) => (
            <Box>
              <Typography>{e}</Typography>
            </Box>
          ))
        : ""}
    </>
  );
}
