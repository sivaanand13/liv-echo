import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Container, Card, CardHeader } from "@mui/material";
function Account() {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  return (
    <Container
      sx={{
        justifyContent: "center",
        display: "flex",
        overflow: "auto",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Card sx={{ minWidth: "40%", maxWidth: "50%", padding: "2rem" }}>
        <CardHeader title={`Welcome, ${currentUser.displayName}!`} />
      </Card>
    </Container>
  );
}

export default Account;
