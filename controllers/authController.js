import pkg from "validator";
import jwt from "jsonwebtoken";
import Transaction from "../db/Transmodel.js";

import nodemailer from "nodemailer";
import User from "../db/Usermodel.js";
import { customAlphabet } from "nanoid";

const saltRounds = 11;

const { isEmail, isEmpty } = pkg;

const checkEmail = (email) => {
  let valid = true;
  if (isEmpty(email) || !isEmail(email)) {
    valid = false;
  }
  return valid;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (obj) => {
  //returns a token with a signature and headers are automatically applied
  return jwt.sign(obj, "been working since the jump", {
    expiresIn: maxAge,
  });
};
const alphabet = "0123456789";
const nanoid = customAlphabet(alphabet, 11); // Generate a 10-digit number

const signup = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dial,
    account,
    address,
    date,
    currency,
  } = req.body;

  const msg = checkUserDetails({
    firstName,
    lastName,
    email,
    password,
    dial,
    account,
    address,
    date,
    currency,
  });
  try {
    if (
      msg.firstName !== "" ||
      msg.lastName !== "" ||
      msg.email !== "" ||
      msg.password !== ""
    ) {
      res.status(400).json({ msg });
    } else {
      // Generate a unique 10-digit number
      let accountNumber = nanoid();

      // Ensure account number is 12 digits long and starts with "01"
      accountNumber = "0" + "1" + accountNumber;

      const user = await User.create({
        firstName,
        lastName,
        email,
        dial,
        account,
        address,
        date,
        currency,
        password,
        accountNumber, // Assign the generated account number to the user
        deposit: 0,
        withdrawal: 0,
        balance: 0,
      });
      const token = createToken({ user: user._id });

      let msg = `Dear User, Welcome to .
                \nRegards, 
                        \nSilverStonefi`;
      let html = `<div> <div> Dear User,<div/>
                <div>Welcome to Silverstonefi, click  <a href="https://silverstonefi.com/on-activate/${email}$">this<a/> link to activate your email</div>
  
  
                  <div style="padding-top:70px">Regards,<div/>
                  <div>Silverstonefi<div/> <div/>`;
      await sendMailx(msg, email, html, "Successful Registration");

      res.status(201).json({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          dial: user.dial,
          account: user.account,
          address: user.address,
          date: user.date,
          currency: user.currency,
          password: user.password,
          accountNumber: user.accountNumber, // Include the account number in the response
          deposit: 0,
          withdrawal: 0,
          balance: 0,
        },
        token,
      });
    }
  } catch (err) {
    console.log({ err });

    let msg = "error signing up";
    if (err.code == "11000") {
      msg = "email has been used by another user";
    }
    const errors = handleErrors(err);
    res.status(400).json({ status: "failed", msg });
  }
};

const activateUser = async (req, res) => {
  const email = req.params.email;
  console.log({ email });
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({ status: "Email activation failed." });
  }
  user.active = true;
  await user.save();
  res.status(200).json({ status: "Email has been activated." });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log({ email, password });
  const validEmail = checkEmail(email);

  try {
    if (validEmail) {
      const user = await User.findOne({ email });

      if (user !== null && user.password === password) {
        const token = createToken({ user: user._id });

        res.status(201).json({
          user,
          token,
        });
      } else {
        res.status(400).json({ error: "Invalid credentials" });
      }
    } else {
      throw Error;
    }
  } catch (err) {
    // console.log({ err });

    let msg = "error during login";
    console.log({ err });
    res.status(400).json({ status: "failed", msg });
  }
};

const editProfile = async (req, res) => {
  const { email, name, phone } = req.body;

  if (checkEmail(email)) {
    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.json({ error: "User Not Found" });
      }

      user = await User.findOneAndUpdate(
        { email },
        { name, phone },
        {
          new: true,
        }
      );

      // sendingMsg('deposit', deposit, 'Update on Deposit', email);
      // sendingMsg('withdrawal', withdrawal, 'Update on Withdrawal', email);
      // sendingMsg('profit', profits, 'Update on Profit', email);

      res.json({ user, msg: "User Edit Successful" });
    } catch (err) {
      res.json({ err: "try again later?" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

const getProfile = async (req, res) => {
  if (!req.body.email) {
    res.json({ error: "User Not Found" });
  }

  const { email } = req.body;

  if (checkEmail(email)) {
    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.json({ error: "User Not Found" });
      }

      // sendingMsg('deposit', deposit, 'Update on Deposit', email);
      // sendingMsg('withdrawal', withdrawal, 'Update on Withdrawal', email);
      // sendingMsg('profit', profits, 'Update on Profit', email);

      res.json({ user, msg: "User retrieved" });
    } catch (err) {
      res.json({ err: "try again later?" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

// const userHistory = async (req, res) => {
//  const email = req.body;

//   try {
//     const transactions = await Transaction.find({ email: email }).sort({ timestamp: -1 });
//     res.status(200).json({ transactions });
//   } catch (error) {
//     console.error('Error retrieving user transactions:', error);
//     res.status(500).json({ error: 'An error occurred while retrieving user transactions' });
//   }
// };

const editAccount = async (req, res) => {
  const { email, btc } = req.body;
  if (checkEmail(email)) {
    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.json({ error: "User Not Found" });
      }

      user = await User.findOneAndUpdate(
        { email },
        { btc },
        {
          new: true,
        }
      );

      // sendingMsg('deposit', deposit, 'Update on Deposit', email);
      // sendingMsg('withdrawal', withdrawal, 'Update on Withdrawal', email);
      // sendingMsg('profit', profits, 'Update on Profit', email);

      res.json({ user, msg: "User Edit Successful" });
    } catch (err) {
      res.json({ err: "try again later?" });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

const handleErrors = (err) => {
  let msg = "error signing up";
};

const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.json("logout");
};

const checkUserDetails = (details) => {
  let message = { email: "", firstName: "", lastName: "", password: "" };
  if (!isEmail(details.email)) {
    if (isEmpty(details.email)) {
      message.email = "Email cannot be empty";
    } else {
      message.email = `${details.email} is not a valid email`;
    }
  }
  if (isEmpty(details.firstName))
    message.firstName = `First Name cannot be empty`;
  if (isEmpty(details.lastName)) message.lastName = `Last Name cannot be empty`;

  if (isEmpty(details.password)) {
    message.password = `Password cannot be empty`;
  } else if (details.password.length < 6) {
    message.password = "passord should be more than 6 characters";
  }

  return message;
};

const sendPassword = async (req, res) => {
  const log = req.params.log;
  console.log({ log });
  let msg = `We just received a password reset for ${log}. \n 
  Please click the link to reset your password: silverstonefi.com/xids54327/${log}
\nRegards, 
\nBrax Trade`;
  let html = `<div> <div> We just received a password reset for ${log}. \n 
  Please click the  <a href="http://silverstonefi.com/xids54327/${log}$">link<a/> to reset your password<div/>


<div style="padding-top:70px">Regards,<div/>
<div>Silverstonefi<div/> <div/>`;
  await sendMailx(msg, log, html, "Forgot Password");
  res.send("done");
};

const changePassword = async (req, res) => {
  const { email, pwd } = req.body;
  console.log({ pwd });
  if (checkEmail(email)) {
    try {
      const isDone = await User.findOneAndUpdate(
        { email },
        {
          password: pwd,
        }
      );
      console.log({ isDone });
      res.json(isDone);
    } catch (err) {
      res.json({ err });
    }
  } else {
    res.json({ err: "invalid email" });
  }
};

const sendMailx = async (output, email, h, s) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "silverstonefi.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "support@silverstonefi.com",
        pass: "Loudgoes$1", // generated ethereal password
      },
    });

    let info = await transporter.sendMail({
      from: '"silverstonefi.com"  <support@silverstonefi.com>', // sender address
      to: email, // list of receivers
      subject: s, // Subject line
      text: output, // plain text body
      html: h,
    });
    console.log(info);
  } catch (err) {
    console.log(err);
  }
};

export default {
  signup,
  login,
  logout,
  // userHistory,
  editAccount,
  editProfile,
  getProfile,
  sendPassword,
  changePassword,
  activateUser,
};
