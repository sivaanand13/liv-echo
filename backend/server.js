import express from "express";
import cors from "cors";
import configRoutes from "./routes/index.js";
import dotenv from "dotenv";
import initMongoConnection from "./config/dbConnection.js";
import initFirebaseAdmin from "./firebase/initFirebaseAdmin.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

initMongoConnection();
initFirebaseAdmin();

configRoutes(app);

app.listen(3000, () => {
  console.log("LivEcho server runing on port 3000");
  console.log("URL: http://localhost:3000/");
});
