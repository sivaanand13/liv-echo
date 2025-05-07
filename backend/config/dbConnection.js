import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// console.log(process.env.MONGO_URI);

const initMongoConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected Mongoose to MongoDB");
  } catch (e) {
    console.log("Failed to Connect Mongoose to MongoDB:", e);
  }
};

export default initMongoConnection;
