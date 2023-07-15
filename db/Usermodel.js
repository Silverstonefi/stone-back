import mongoose from "mongoose";
import { customAlphabet } from "nanoid";


const alphabet = '0123456789';
const nanoid = customAlphabet(alphabet, 10); // Generate a 10-digit number

const generateSenderAccountNumber = () => {
  let accountNumber = nanoid();
  accountNumber = "01" + accountNumber.slice(0, 10);
  return accountNumber;
};

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
    type: Number,
    default: generateSenderAccountNumber,
  },
  cardHolder: {
    type: "string",
    default: "",
    default: "",
  },
  accountNumber: {
    type: String,
    default: "",
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  // receiverAcct: {
  //   type: String,
  //   default: "",
  //   unique: true,
  // },
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
