import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: "string",
    required: true,
  },
  lastName: {
    type: "string",
    required: true,
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  accountType: {
    type: "string",
    default: "",
  },
  cardHolder: {
    type: "string",
    default: "",
    default: "",
  },
  // accountNumber: {
  //   type: String,
  //   default: "",
  // },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  senderAcct: {
    type: String,
    default: "",
    unique: true,
  },
  receiverAcct: {
    type: String,
    default: "",
    unique: true,
  },
  address: {
    type: String,
    default: "",
  },
  zipcode: {
    type: String,
    default: "",
  },
  bankName: {
    type: String,
    default: "",
  },
  routingNumber: {
    type: Number,
    default: 0,
  },
  phone: {
    type: String,
    default: "",
  },
  deposit: {
    type: Number,
    default: 0,
  },
  withdrawal: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: false,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  ],
});

export default mongoose.model("User", userSchema);
