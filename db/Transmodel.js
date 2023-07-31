import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "direct transfer"],
  },
  amount: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  action: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "complete", "failed"],
    default: "pending",
  },
});

export default mongoose.model("Transaction", transactionSchema);
