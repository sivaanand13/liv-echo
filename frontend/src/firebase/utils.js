import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signOut,
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

export default { createFirebaseUser, deleteFirebaseUser, signOutFirebaseUser };
