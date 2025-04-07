import validation from "../utils/validation.js";
import User from "../models/user.js";
import { verifyUserByUID } from "../firebase/firebaseUtils.js";

async function validateUnqiueEmail(email) {
  email = validation.validateEmail(email);
  const user = await User.findOne({ email: email });
  return user ? false : true;
}

async function validateUnqiueUsername(username) {
  username = validation.validateUsername(username);
  const user = await User.findOne({ username: username });
  return user ? false : true;
}

async function signUpUser(uid, name, email, username, dob) {
  await verifyUserByUID(uid);
  name = validation.validateString(name, "Name");

  email = validation.validateEmail(email);
  await validateUnqiueEmail(email);

  username = validation.validateUsername(username, "Username");
  await validateUnqiueUsername(username);

  validation.validateDob(dob, "Date of Birth");

  const user = await User.create({
    uid,
    name,
    email,
    username,
    dob: new Date(dob),
  });
}

export default {
  validateUnqiueEmail,
  validateUnqiueUsername,
  signUpUser,
};
