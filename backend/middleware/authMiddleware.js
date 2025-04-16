import firebaseUtils from "../firebase/firebaseUtils.js";

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No auth token provided" });
  }
  try {
    const token = authHeader.split("Bearer ")[1];
    const user = await firebaseUtils.verifyAuthToken(token);
    req.user = user;
    console.log("Authenticated user: " + user.uid);
    next();
  } catch (error) {
    console.log("Error verifying token:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid auth token" });
  }
}
