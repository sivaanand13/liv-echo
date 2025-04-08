import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signOut,
  signInWithEmailAndPassword
} from "firebase/auth";

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
async function signInFirebaseUser(email,password) {
  const auth = getAuth()
  await signInWithEmailAndPassword(auth,email,password);
}
export default { createFirebaseUser, deleteFirebaseUser, signOutFirebaseUser, signInFirebaseUser };
