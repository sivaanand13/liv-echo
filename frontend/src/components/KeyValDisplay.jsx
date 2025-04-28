import { Box, Typography, List, ListItem } from "@mui/material";
function KeyValDisplay({ variant, label, value, trueValue, falseValue, sx }) {
  return (
    <Typography sx={{ ...sx }} variant={variant || "body1"}>
      <strong>{label}: </strong>
      {value == null
        ? "Not avaliable"
        : typeof value === "boolean"
        ? value
          ? trueValue || "Yes"
          : falseValue || "No"
        : value}
    </Typography>
  );
}

export default KeyValDisplay;
