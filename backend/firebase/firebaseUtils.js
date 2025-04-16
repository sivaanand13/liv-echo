import admin from "firebase-admin";

export async function verifyUserByUID(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    return user;
  } catch (error) {
    console.log("Error verifying user by UID:", error);
    throw `No user with firebase id (${uid})`;
  }
}

export async function verifyAuthToken(token) {
  try {
    token = await admin.auth().verifyIdToken(token);
    return token;
  } catch (error) {
    console.log("Error verifying auth token");
    throw `Invalid auth token`;
  }
}

export default { verifyUserByUID, verifyAuthToken };
