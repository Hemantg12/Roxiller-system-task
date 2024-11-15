import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import cors from 'cors'
dotenv.config();
connectDb();

const app = express();
app.use(express.json());

app.use("/api", transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get("/", (req, res) => {
  res.send("Hello");
});


app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );