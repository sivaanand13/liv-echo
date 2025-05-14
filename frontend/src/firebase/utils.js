import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signOut,
  signInWithEmailAndPassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";

async function createFirebaseUserWithGoogle(email, password, displayName) {
  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();
  await signInWithPopup(auth, googleProvider);
}

async function createFirebaseUser(email, password, displayName) {
  const auth = getAuth();
  await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(auth.currentUser, { displayName: displayName });
  await sendEmailVerification(auth.currentUser);
}

async function deleteFirebaseUser() {
  const auth = getAuth();
  await deleteUser(auth.currentUser);
}

async function signOutFirebaseUser() {
  const auth = getAuth();
  await signOut(auth);
}
async function signInFirebaseUser(email, password) {
  const auth = getAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);

  let user = credential.user;
  // console.log("sign in user: ", user);
  if (user.emailVerified != null && !user.emailVerified) {
    try {
      await sendEmailVerification(user);
    } catch (e) {
      await signOutFirebaseUser();
    }
    await signOutFirebaseUser();
    alert(
      "You havn't verified your email yet! Please check your inbox for the verification link!"
    );
    throw "Email not verified!";
  }
  return user;
}

async function reauthenticateFirebaseUser(oldPassword) {
  const auth = getAuth();
  let credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    oldPassword
  );
  await reauthenticateWithCredential(auth.currentUser, credential);
}
export default {
  createFirebaseUser,
  deleteFirebaseUser,
  signOutFirebaseUser,
  signInFirebaseUser,
  reauthenticateFirebaseUser,
  createFirebaseUserWithGoogle,
};
