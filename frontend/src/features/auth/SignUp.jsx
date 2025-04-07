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

function SignUp() {
  const { currentUser } = useContext(AuthContext);

  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
  const validateConfirmPassword = (e) => {
    if (e) {
      setConfirmPassword(e.target.value);
    }

    if (e) {
      if (password !== e.target.value) {
        setConfirmPasswordError("Password and Confirm Password are not equal!");
      } else setConfirmPasswordError("");
    } else {
      if (password == "") {
        setConfirmPasswordError("Password is not filled in!");
      } else if (password !== confirmPassword) {
        setConfirmPasswordError("Password and Confirm Password are not equal!");
      } else setConfirmPasswordError("");
    }
  };

  const handleSignUp = async (e) => {
    console.log("SignUp.jsx", "Handler for sign up");
    e.preventDefault();

    setError("");
    validateField(name, validation.validateString, setName, setNameError);
    validateField(email, validation.validateEmail, setEmail, setEmailError);
    validateField(
      username,
      validation.validateUsername,
      setUsername,
      setUsernameError
    );
    validateField(dob, validation.validateDob, setDob, setDobError);
    validateField(
      password,
      validation.validatePassword,
      setPassword,
      setPasswordError
    );
    validateConfirmPassword();

    const invalidFields = [
      nameError,
      emailError,
      usernameError,
      dobError,
      passwordError,
      confirmPasswordError,
    ].some((e) => e != "");

    if (invalidFields) {
      setError("Please fix errors before submitting!");
      return;
    } else {
      try {
        await authUtils.signUpUser(name, email, username, dob, password);
      } catch (e) {
        console.log("SignUp.jsx", e);
        setError(e);
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
          <Typography variant="h4" sx={{ width: "100%" }}>
            Sign Up
          </Typography>

          <FormControl>
            <FormLabel htmlFor="name">Name</FormLabel>
            <TextField
              error={nameError != ""}
              helperText={nameError}
              id="name"
              type="text"
              name="name"
              autoComplete="name"
              autoFocus
              required
              fullWidth
              value={name}
              onChange={(e) =>
                validateField(
                  name,
                  validation.validateString,
                  setName,
                  setNameError,
                  e
                )
              }
            />
          </FormControl>
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
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
              error={usernameError != ""}
              helperText={usernameError}
              id="username"
              type="text"
              name="username"
              autoComplete="username"
              required
              fullWidth
              value={username}
              onChange={(e) =>
                validateField(
                  username,
                  validation.validateUsername,
                  setUsername,
                  setUsernameError,
                  e
                )
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="dob">Date of Birth</FormLabel>
            <TextField
              error={dobError != ""}
              helperText={dobError}
              id="dob"
              type="date"
              name="dob"
              autoComplete="bday"
              required
              fullWidth
              value={dob}
              onChange={(e) =>
                validateField(
                  dob,
                  validation.validateDob,
                  setDob,
                  setDobError,
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
          <FormControl>
            <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
            <TextField
              error={confirmPasswordError != ""}
              helperText={confirmPasswordError}
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirm-password"
              required
              fullWidth
              value={confirmPassword}
              onChange={validateConfirmPassword}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        onClick={toggleShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleSignUp}
          >
            Sign Up
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}

export default SignUp;
