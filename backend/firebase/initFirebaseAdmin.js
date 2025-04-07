import admin from "firebase-admin";
import serviceKey from "./serviceAccountKey.json" with { type: "json" };

export default function initFirebaseAdmin() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceKey),
  });
}
