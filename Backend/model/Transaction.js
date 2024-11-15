// models/Transaction.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
  sold: Boolean,
});

export default mongoose.model("Transaction", transactionSchema);
