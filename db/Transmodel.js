import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "transfer"],
  },
  amount: Number,
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
}, {
  timestamps: true,
});

export default mongoose.model("Transaction", transactionSchema);
