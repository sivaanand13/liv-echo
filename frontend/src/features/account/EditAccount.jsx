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
  const { currentUser, user: serverUser } = useContext(AuthContext);

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
  const [hasError, setHasError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        setHasError(true);
      }
    } else {
      try {
        validationFunc(stateVar);
        setErrorState("");
      } catch (e) {
        const errors = [].concat(e);
        setErrorState(errors.join("\n"));
        setHasError(true);
      }
    }
  };
  const handleEditAccount = async (e) => {
    e.preventDefault();

    setHasError(false);
    setError("");
    setNameError("");
    setEmailError("");
    setUsernameError("");
    setDobError("");
    setPasswordError("");
    setOldPasswordError("");

    const finalName = name || currentUser.displayName;
    const finalEmail = email || currentUser.email;
    const finalUsername = username || serverUser.username;
    const finalDOB = dob || serverUser.dob;
    const finalPassword = password || undefined;
    const finalOldPassword = oldPassword || undefined;
    if (name) {
      validateField(name, validation.validateString, setName, setNameError);
    }
    if (email.trim() && finalEmail != currentUser.email) {
      validateField(email, validation.validateEmail, setEmail, setEmailError);
      validateField(
        oldPassword,
        validation.validatePassword,
        setOldPassword,
        setOldPasswordError
      );
    }
    if (username) {
      validateField(
        username,
        validation.validateUsername,
        setUsername,
        setUsernameError
      );
    }
    if (dob) {
      validateField(dob, validation.validateDob, setDob, setDobError);
    }

    if (password) {
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

    if (
      currentUser.email.trim().toLowerCase() !== email.trim().toLowerCase() &&
      password
    ) {
      setError(`You can only change email or password at on time!`);
      return;
    }


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
      const auth = getAuth();
      await auth.currentUser.reload(); // Refresh the user object
      const updatedUser = auth.currentUser;
      handleClose();
    } catch (e) {
      console.log(e);
      if (e.type === "moderation") {
        console.log("Account.jsx", e);
        setError(e.message);
        return;
      }
      setError(e || "Edit account failed!");
      return;
    }
  };
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return (
    <Container
      sx={{
        justifyContent: "center",
        overflow: "auto",
        width: "100%",
        maxHeight: "80vh",
        overflowY: "auto",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card sx={{ width: "100%", padding: "2rem" }}>
        <Stack spacing={2} width="100%">
          {/* Welcome Message */}
          <Typography variant="h5" sx={{ textAlign: "center" }}>
            Welcome, {currentUser.displayName}!
          </Typography>
          <Typography variant="h4" sx={{ width: "100%" }}>
            Edit Account
          </Typography>
          <Typography variant="h7" sx={{ width: "100%" }}>
            To edit your account you can add in any of the fields you want to
            but you dont have to. However, to change email or password you need
            to put in your current password
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
              onChange={(e) => setEmail(e.target.value)}
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
            <Typography>
              *Current password is reqired to update password!
            </Typography>

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
          <Typography>*Only fill in what you want to update.</Typography>

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
      </Card>
    </Container>
  );
}

export default EditAccount;
