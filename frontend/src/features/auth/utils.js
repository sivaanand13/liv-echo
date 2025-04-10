import { get, post } from "../../utils/requests/axios.js";
import firebaseUtils from "../../firebase/utils.js";
import { getAuth, updateProfile, updateEmail, updatePassword } from "firebase/auth";
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
    await post("users/signup/", { uid: user.uid, name, email, username, dob });
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
    if (!user) {
      throw new Error("No user is currently logged in!");
    }
    //console.log(user);
    console.log("Hi");
    await post("users/editAccount/", {
      uid: user.uid,
      name,
      email,
      username,
      dob,
    });
    if (user) {
      await updateProfile(user, {
        displayName: name,
      });
      if (email !== user.email) {
        console.log("EMAIL PLS");
        await updateEmail(user, email);
      }
      if (password) {
        console.log("Password pls");
        await updatePassword(user, password);
      }
    }
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
