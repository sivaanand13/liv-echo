import { get, post } from "../../utils/requests/axios.js";
import firebaseUtils from "../../firebase/utils.js";
import { getAuth } from "firebase/auth";
import validation from "../../utils/validation.js";
async function signUpUser(name, email, username, dob, password) {
  try {
    validation.validateString(name);
    validation.validateString(email);
    validation.validateUsername(username);
    validation.validateDob(dob);
    validation.validatePassword(password);
  } catch (e) {
    console.log(e);
    throw "Fix errors before submitting!";
  }

  try {
    await get("users/signup/uniqueCheck/", {
      email: email,
      username: username,
    });
  } catch (e) {
    console.log(e);

    throw e.data && e.data.message
      ? e.data.message
      : "Email and Username are already taken!";
  }

  try {
    const user = await firebaseUtils.createFirebaseUser(email, password, name);
  } catch (e) {
    console.log(e);
    throw e.message;
  }

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    console.log(user);
    const val = await post("users/signup/", { uid: user.uid, name, email, username, dob });
    return val.data
  } catch (e) {
    await firebaseUtils.deleteFirebaseUser();
    console.log(e);
    throw e.data && e.data.message
      ? e.data.message
      : "Sign in failed! Try again.";
  }
}

async function signInUser( username, email, password) {
  try {
    validation.validateEmail(email);
    validation.validateUsername(username);
    validation.validatePassword(password);
  } catch (e) {
    console.log(e);
    throw "Fix errors before submitting!";
  }

  try {
    const user = await firebaseUtils.signInFirebaseUser(email, password);
  } catch (e) {
    console.log(e);
    throw e.message;
  }

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    await post("users/signin/", { uid: user.uid, email, username});
  } catch (e) {
    console.log(e);
    throw e.data && e.data.message
      ? e.data.message
      : "Sign in failed! Try again.";
  }
}
async function editUser(name, email, username, dob, password) {
  try {
    validation.validateString(name);
    validation.validateString(email);
    validation.validateUsername(username);
    validation.validateDob(dob);
    validation.validatePassword(password);
  } catch (e) {
    console.log(e);
    throw "Fix errors before submitting!";
  }

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    console.log(user);
    console.log("Hi");
    await post("users/editAccount/", {
      uid: user.uid,
      name,
      email,
      username,
      dob,
    });
  } catch (e) {
    console.log(e);
    throw e.data && e.data.message
      ? e.data.message
      : "Failed to update Account! Try Again";
  }
}
export default {
  signUpUser,
  signInUser,
  editUser
};
