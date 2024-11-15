import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDb = () => {
  mongoose
    .connect(process.env.MongoUrl)
    .then(() => console.log("db connected successfully"))
    .catch((error) => console.log(error.message));
};
