import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const initMongoConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected Mongoose to MongoDB");
  } catch (e) {
    console.log("Failed to Connect Mongoose to MongoDB:", e);
  }
};

export default initMongoConnection;
