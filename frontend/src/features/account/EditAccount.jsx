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
  DialogContent,
} from "@mui/material";
import { useState, useContext, useEffect } from "react";
import { getAuth } from "firebase/auth";
import validation from "../../utils/validation.js";
import authUtils from "../auth/utils.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { Navigate } from "react-router";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Errors from "../../components/Errors.jsx";
import { toDate } from "date-fns";
function EditAccount({ handleClose }) {
  const { currentUser, serverUser } = useContext(AuthContext);

  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    username: false,
    dob: false,
    password: false,
    oldPassword: false,
  });
  console.log(currentUser);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const toggleShowOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || "");
      setEmail(currentUser.email || "");
      setUsername(currentUser.username || "");
      setDob(currentUser.dob || "");
    }
  }, [currentUser]);
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
        const errors = [].concat(e);
        setErrorState(errors.join("\n"));
      }
    } else {
      try {
        validationFunc(stateVar);
        setErrorState("");
      } catch (e) {
        const errors = [].concat(e);
        setErrorState(errors.join("\n"));
      }
    }
  };
  const handleEditAccount = async (e) => {
    console.log("Account.jsx", "Handler for editing account");
    e.preventDefault();

    setError("");
    const finalName = name.trim() || currentUser.displayName;
    const finalEmail = email.trim() || currentUser.email;
    const finalUsername = username.trim() || serverUser.username;
    const finalDOB = dob.trim() || serverUser.dob;
    const finalPassword = password.trim() || undefined;
    const finalOldPassword = oldPassword.trim() || undefined;
    if (name.trim()) {
      validateField(name, validation.validateString, setName, setNameError);
    }
    if (email.trim() && email.trim() !== currentUser.email) {
      validateField(email, validation.validateEmail, setEmail, setEmailError);
      validateField(
        oldPassword,
        validation.validatePassword,
        setOldPassword,
        setOldPasswordError
      );
    }
    if (username.trim()) {
      validateField(
        username,
        validation.validateUsername,
        setUsername,
        setUsernameError
      );
    }
    if (dob.trim()) {
      validateField(dob, validation.validateDob, setDob, setDobError);
    }

    if (password.trim()) {
      validateField(
        password,
        validation.validatePassword,
        setPassword,
        setPasswordError
      );
      validateField(
        oldPassword,
        validation.validatePassword,
        setOldPassword,
        setOldPasswordError
      );
    }
    if (!name && !password && !oldPassword && !email && !dob && !username) {
      setError("Must put in 1 field at least before submitting");
      return;
    }

    const invalidFields = [
      nameError,
      emailError,
      usernameError,
      dobError,
      passwordError,
      oldPasswordError,
    ].some((e) => e != "");

    if (invalidFields) {
      setError("Please fix errors before submitting!");
      return;
    } else {
      try {
        const result = await authUtils.editUser(
          finalName,
          finalEmail,
          finalUsername,
          finalDOB,
          finalPassword,
          finalOldPassword
        );
        if (result?.emailPendingVerification) {
          setError(result.message);
          return;
        }
        handleClose();
      } catch (e) {
        console.log("Account.jsx", e);
        setError(e.message || "Edit account failed!");
      }
    }
  };
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return (
    <Box
      sx={{
        width: "fit-content",
        height: "fit-content",
        padding: "2em",
        maxWidth: "80vw",
      }}
    >
      <DialogContent sx={{ width: "100%", padding: "2rem" }}>
        <Stack spacing={2} width="100%">
          {/* Welcome Message */}
          <Typography variant="h5" sx={{ textAlign: "center" }}>
            Welcome, {currentUser.displayName}!
          </Typography>
          <Typography variant="h4" sx={{ width: "100%" }}>
            Edit Account
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
            <FormLabel htmlFor="old-password">Current Password</FormLabel>
            <TextField
              error={oldPasswordError !== ""}
              helperText={oldPasswordError}
              id="old-password"
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              required
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showOldPassword ? "Hide password" : "Show password"
                        }
                        onClick={toggleShowOldPassword}
                        edge="end"
                      >
                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={handleEditAccount}
          >
            Update Account
          </Button>
          <Button
            type="reset"
            fullWidth
            variant="contained"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </Stack>
      </DialogContent>
    </Box>
  );
}

export default EditAccount;
