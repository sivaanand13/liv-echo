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
  await signInWithEmailAndPassword(auth, email, password);
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
