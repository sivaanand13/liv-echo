import { CircularProgress } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  margin: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  size: "20%",
}));

function Loading() {
  const theme = useTheme();
  return <StyledCircularProgress size="10%" />;
}

export default Loading;
