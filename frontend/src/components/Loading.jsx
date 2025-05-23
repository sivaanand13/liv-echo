import { CircularProgress } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  overflowY: "scroll";
  margin: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  width: "20%",
  height: "20%"
}));

function Loading() {
  const theme = useTheme();
  return <StyledCircularProgress size="10%" />;
}

export default Loading;
