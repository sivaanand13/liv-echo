import express from "express";
import https from "https";
import cors from "cors";
import dotenv from "dotenv";
import configRoutes from "./routes/index.js";
import configSocketHandlers from "./websockets/index.js";
import configMongoConnection from "./config/dbConnection.js";
import configFirebaseAdmin from "./firebase/initFirebaseAdmin.js";
import configCloudinary from "./cloudinary/config.js";
import configMiddlewares from "./middleware/index.js";
import { Server } from "socket.io";
import configSSL from "./ssl/configSSL.js";

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

const type = process.env.ENV_TYPE;
let server;
if (type == "prod") {
  server = https.createServer(configSSL, app);

  server.listen(3000, () => {
    console.log("LivEcho https server runing on port 3000.");
    console.log("URL: https://localhost:3000/");
  });
} else {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT, () => {
    console.log(`LivEcho https server running on port ${PORT}.`);
    console.log(`URL: http://localhost:${PORT}`);
  });
}

configSocketHandlers(server);
