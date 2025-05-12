import {
  Card,
  Container,
  Box,
  Typography,
  FormLabel,
  FormControl,
  TextField,
  Stack,
  Button,
  InputAdornment,
  IconButton,
  OutlinedInput,
} from "@mui/material";
import { useState, useContext } from "react";
import validation from "../../utils/validation.js";
import authUtils from "./utils.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { Navigate } from "react-router";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CustomLink from "../../components/CustomLink.jsx";

function SignIn() {
  const { currentUser } = useContext(AuthContext);

  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const validateField = (
    stateVar,
    validationFunc,
    setStateVar,
    setErrorState,
    e
  ) => {
    if (e) {
      setStateVar(e.target.value);

      try {
        validationFunc(e.target.value);
        setErrorState("");
      } catch (e) {
        const errors = [].concat(e).join(" ");
        setErrorState(errors);
      }
    } else {
      try {
        validationFunc(stateVar);
        setErrorState("");
      } catch (e) {
        const errors = [].concat(e).join(" ");
        setErrorState(errors);
      }
    }
  };
  const handleSignIn = async (e) => {
    console.log("SignIn.jsx", "Handler for sign in");
    e.preventDefault();

    setError("");
    validateField(
      password,
      validation.validatePassword,
      setPassword,
      setPasswordError
    );
    validateField(email, validation.validateEmail, setEmail, setEmailError);

    const invalidFields = [passwordError, emailError].some((e) => e != "");

    if (invalidFields) {
      setError("Please fix errors before submitting!");
      return;
    } else {
      try {
        await authUtils.signInUser(null, email, password);
      } catch (e) {
        console.log("SignIn.jsx", e.message);
        setError(`Invalid email and password combination!`);
      }
    }
  };

  if (currentUser) {
    return <Navigate to="/account" />;
  }
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
        <Stack spacing={2} width="100%">
          <Typography variant="h4" sx={{ width: "100%", textAlign: "center" }}>
            Sign In
          </Typography>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              error={emailError != ""}
              helperText={emailError}
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              fullWidth
              value={email}
              onChange={(e) =>
                validateField(
                  email,
                  validation.validateEmail,
                  setEmail,
                  setEmailError,
                  e
                )
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              error={passwordError != ""}
              helperText={passwordError}
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
              fullWidth
              value={password}
              onChange={(e) =>
                validateField(
                  password,
                  validation.validatePassword,
                  setPassword,
                  setPasswordError,
                  e
                )
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormControl>
          {error && (
            <Typography sx={{ color: "red", textAlign: "center" }}>
              {error}
            </Typography>
          )}
          <Stack
            sx={{ textAlign: "center", justifyContent: "center" }}
            textAlign="center"
            direction="row"
          >
            <Typography>Don't have an account yet? </Typography>

            <CustomLink
              color={"blue"}
              sx={{
                textDecoration: "none",
                marginLeft: "0.2em",
                fontWeight: "bold",
                "&:hover": {
                  textDecoration: "underline",

                  color: "#0F03FF",
                },
              }}
              to={"/signup"}
            >
              {"  "}Sign Up
            </CustomLink>
          </Stack>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleSignIn}
          >
            Sign In
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
export default SignIn;
