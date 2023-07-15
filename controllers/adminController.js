import pkg from "validator";
import nodemailer from "nodemailer";
import User from "../db/Usermodel.js";
import Transaction from "../db/Transmodel.js";

const { isEmail, isEmpty } = pkg;

// Utility functions
const checkEmail = (email) => {
  let valid = true;
  if (isEmpty(email) || !isEmail(email)) {
    valid = false;
  }
  return valid;
};

const sendMailx = async (output, email, h, s) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "silverstonefi.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "support@silverstonefi.com",
        pass: "ethereal$12", // generated ethereal password
      },
    });

    let info = await transporter.sendMail({
      from: '"Silverstonefi" <support@silverstonefi.com>', // sender address
      to: email, // list of receivers
      subject: s, // Subject line
      text: output, // plain text body
      html: h,
    });
  } catch (err) {
    console.log(err);
  }
};

const sendingMsg = (name, value, heading, email) => {
  edit;
  if (value > 0) {
    const themsg = `Your ${name} of ${value}USD has been approved for your account. 
    \nThank you for choosing whitebull safety . For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@silverstonefi.com \n

    \nRegards, 
    \nSilverstonefi`;

    sendMailx(themsg, email, "", heading);
  }
};

// Controller functions
// get all users
export const allUsers = async (req, res) => {
  const users = await User.find({});

  const filtered = users.filter((user) => user.role !== "admin");

  res.json({ users: filtered, count: filtered.length });
};

// get all withdrawals
export const withdrawals = async (req, res) => {
  const users = await User.find({});
  const filtered = users.filter(
    (user) => user.withdrawal > 0 && user.role !== "admin"
  );

  res.json({ users: filtered, count: filtered.length });
};

// get all deposits
export const deposits = async (req, res) => {
  const users = await User.find({});

  const filtered = users.filter(
    (user) => user.deposit > 0 && user.role !== "admin"
  );

  res.json({
    users: filtered,
    count: filtered.length,
  });
};

export const editUser = async (req, res) => {
  const { email, name, withdrawal, deposit, balance, profits } = req.body;

  if (checkEmail(email)) {
    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.json({ error: "User Not Found" });
      }

      user = await User.findOneAndUpdate(
        { email },
        { name, withdrawal, deposit, balance, profits },
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

export const deleteUser = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // console.log('user', user);

  if (!user) {
    // console.log('no user to delete');
    res.json({ msg: "email not found" });
  } else if (user.role !== "admin") {
    //if not the admin delete
    await User.findOneAndRemove({ email });
    res.json({ msg: "user deleted successfully" });
  }
};

export const deposit = async (req, res) => {
  const { email, deposit } = req.body;

  if (!email || !deposit) {
    return res.json({ msg: "Please provide necessary fields" });
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let msg = `Your deposit has been made. Login to access your profile.
      For further assistance, you can reach out to support.\n
      
      \nRegards,
      \nPhoenixfx  Investment.`;
    let html = `<div> <div> Dear User,<div/>
                <div>Congratulations ${email}, You have successfully deposited ${deposit}USD to your account</div>
  
  
                  <div style="padding-top:70px">Regards,<div/>
                  <div>Phoenixfx<div/> <div/>`;

    await sendMailx(msg, email, html, "Deposit Successful");

    user.deposit = deposit;
    user.balance += deposit;

    const transaction = new Transaction({
      userId: user._id,
      type: "deposit",
      amount: deposit,
    });

    await transaction.save();
    user.transactions.push(transaction._id);

    await user.save();

    return res
      .status(200)
      .json({ user, msg: "Deposit successful", balance: user.balance });
  } catch (error) {
    console.error("Error depositing amount:", error);

    let msg = "An error occurred while processing the deposit";
    if (error.code === 11000) {
      msg = "Email has been used by another user";
    }

    return res.status(400).json({ status: "failed", error: msg });
  }
};

export const withdraw = async (req, res) => {
  const { email, withdrawal } = req.body;

  if (!email || !withdrawal) {
    return res.json({ msg: "Please provide necessary fields" });
  }

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has sufficient balance for withdrawal
    if (user.balance < withdrawal) {
      return res
        .status(400)
        .json({ error: "Insufficient balance for withdrawal" });
    }

    let msg = `Your withdrawal has been made. Login to access your profile.
      For further assistance, you can reach out to support.\n
      
      \nRegards,
      \nPhoenixfx  Investment.`;
    let html = `<div> <div> Dear User,<div/>
                <div>Congratulations ${email}, You have successfully withdrawn ${withdrawal}USD from your account</div>
  
                  <div style="padding-top:70px">Regards,<div/>
                  <div>Phoenixfx<div/> <div/>`;

    await sendMailx(msg, email, html, "Withdrawal Successful");

    // Update the withdrawal and balance
    user.withdrawal += withdrawal;
    user.balance -= withdrawal;

    const transaction = new Transaction({
      userId: user._id,
      type: "withdrawal",
      amount: withdrawal,
    });

    await transaction.save();
    user.transactions.push(transaction._id);

    await user.save();

    return res
      .status(200)
      .json({ user, msg: "Withdrawal successful", balance: user.balance });
  } catch (error) {
    console.error("Error withdrawing amount:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the withdrawal" });
  }
};

export const getUserTransactions = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ msg: "Please provide necessary fields" });
  }

  try {
    const user = await User.findOne({ email: email }).populate("transactions");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const transactions = user.transactions.sort(
      (a, b) => a.timestamp - b.timestamp
    );

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error retrieving user transactions:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while retrieving user transactions" });
  }
};

export const transfer = async (req, res) => {
  const { senderAcct, receiverAcct, amount } = req.body;

  try {
    // Find the sender and receiver accounts
    const sender = await User.findOne(senderAcct);
    const receiver = await User.findOne(receiverAcct);

    // Check if sender and receiver accounts exist
    if (!sender || !receiver) {
      return res
        .status(404)
        .json({ error: "Sender or receiver account not found" });
    }

    // Check if sender has sufficient balance
    if (sender.balance < amount) {
      return res
        .status(400)
        .json({ error: "Insufficient balance for transfer" });
    }

    // Deduct amount from sender's balance and create withdrawal transaction
    sender.balance -= amount;
    sender.withdrawal += amount;
    await sender.save();

    const withdrawalTransaction = new Transaction({
      userId: sender.senderAcct,
      type: "withdrawal",
      amount,
    });
    await withdrawalTransaction.save();

    // Add amount to receiver's balance and create deposit transaction
    receiver.balance += amount;
    receiver.deposit += amount;
    await receiver.save();

    const depositTransaction = new Transaction({
      userId: receiver.receiverAcct,
      type: "deposit",
      amount,
    });
    await depositTransaction.save();

    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during transfer" });
  }
};

export const CreateAccountNumber = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by their Email address
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a unique account number
    const accountNumber = generateAccountNumber();

    // Assign the generated account number to the user
   user.accountNumber = accountNumber;
   await user.save();

    res.status(200).json({ accountNumber });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while generating the account number" });
  }

 
};
 // Helper function to generate a unique account number
  const generateAccountNumber = () => {
    // Implement your own logic to generate a unique account number here
    // This can be a combination of alphanumeric characters or a specific format
    // For simplicity, let's assume we generate a random 6-digit number
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  };
// export const approveDeposit = async (req, res) => {
//   const { email, deposit } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     let { balance } = user;

//     balance += deposit;

//     user = await User.findOneAndUpdate(
//       { email },
//       { balance, deposit: 0 },
//       {
//         new: true,
//       }
//     );

//     let msg = `Your Deposit of ${deposit}USD has been approved.
//       \nThank you for choosing Phoenixfx. For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@Phoenixfx .com\n

//       \nRegards,
//       \nPhoenixfx `;

//     // sendMailx(msg, email, 'Update on Deposit status.');

//     res.json({ user, msg: "Deposit approved" });
//   } catch (err) {
//     console.log("approve er", err);
//     res.json({ err: "cant approve deposit at this time" });
//   }
// };

// export const approveWithdrawal = async (req, res) => {
//   //console.log('w');
//   const { email, withdrawal } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     let { balance } = user;

//     if (!(balance <= 0)) {
//       balance -= withdrawal;
//     } else {
//       res.json({ error: "insufficient balance" });
//     }

//     user = await User.findOneAndUpdate(
//       { email },
//       { balance, withdrawal: 0 },
//       {
//         new: true,
//       }
//     );

//     let msg = `Your withdrawal of ${withdrawal}USD has been approved.
//       \nThank you for choosing Phoenixfx. For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@Phoenixfx .com\n

//       \nRegards,
//       \nPhoenixfx `;

//     // sendMailx(msg, email, 'Update on withdrawal status.');

//     res.json({ user, msg: "Withdrawal approved" });
//   } catch (err) {
//     // console.log('approve er', err);
//     res.json({ err: "cant approve withdrawal at this time" });
//   }
// };

// export const declineDeposit = async (req, res) => {
//   const { email, deposit } = req.body;

//   try {
//     const user = await User.findOneAndUpdate(
//       { email },
//       { deposit: 0 },
//       {
//         new: true,
//       }
//     );

//     let msg = `Your Deposit of ${deposit}USD has been declined.
//       \nThank you for choosing Phoenixfx . For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@Phoenixfx .com\n

//       \nRegards,
//       \nPhoenixfx `;

//     // sendMailx(msg, email, 'Update on Deposit status.');

//     res.json({ user, msg: "Deposit declined" });
//   } catch (err) {
//     res.json({ err: "cant approve deposit at this time" });
//   }
// };

// export const declineWithdrawal = async (req, res) => {
//   const { email, withdrawal } = req.body;

//   try {
//     const user = await User.findOneAndUpdate(
//       { email },
//       { withdrawal: 0 },
//       {
//         new: true,
//       }
//     );

//     let msg = `Your withdrawal of ${withdrawal}USD has been declined.
//       \nThank you for choosing Phoenixfx . For complaints or inquires, do not hesitate to contact our 24/7 support team via email: support@Phoenixfx .com\n

//       \nRegards,
//       \nPhoenixfx `;

//     // sendMailx(msg, email, 'Update on withdrawal status.');

//     res.json({ user, msg: "Withdrawal declined" });
//   } catch (err) {
//     res.json({ err: "cant approve withdrawal at this time" });
//   }
// };
