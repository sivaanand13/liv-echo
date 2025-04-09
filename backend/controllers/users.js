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
async function editUser(uid, name, email, username, dob) {
  await verifyUserByUID(uid);
  name = validation.validateString(name, "Name");

  email = validation.validateEmail(email);
  await validateUnqiueEmail(email);

  username = validation.validateUsername(username, "Username");
  await validateUnqiueUsername(username);

  validation.validateDob(dob, "Date of Birth");

  const val = await User.updateMany(
    { uid },
    {$set: {
        name,
        email,
        username,
        dob: new Date(dob),
      },
    }
  );
  let user = await User.findOne({uid: uid});
  console.log("Howdy updated user");
  console.log(val);
  return user;
}

async function signInUser(uid,email,username) {
  username = username.trim();
  if(username.length === 0){
    throw new Error('must enter username');
  }
  email = validation.validateEmail(email);
  await verifyUserByUID(uid);
  await validation.validateUsername(username);
  let user = await User.findOne({username: username});
  return user;
  
}
export default {
  validateUnqiueEmail,
  validateUnqiueUsername,
  signUpUser,
  signInUser,
  editUser
};
