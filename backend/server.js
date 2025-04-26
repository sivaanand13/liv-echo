import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import configRoutes from "./routes/index.js";
import configSocketHandlers from "./websockets/index.js";
import configMongoConnection from "./config/dbConnection.js";
import configFirebaseAdmin from "./firebase/initFirebaseAdmin.js";
import configCloudinary from "./cloudinary/config.js";
import configMiddlewares from "./middleware/index.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

configMongoConnection();
configFirebaseAdmin();
configCloudinary();
configMiddlewares(app);
configRoutes(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`LivEcho server running on port ${PORT}`);
});

configSocketHandlers(app);
