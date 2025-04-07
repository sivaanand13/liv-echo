import admin from "firebase-admin";

async function verifyUserByUID(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    return user;
  } catch (error) {
    console.error("Error verifying user by UID:", error);
    throw `No user with firebase id (${uid})`;
  }
}

export { verifyUserByUID };
