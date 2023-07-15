import { Router } from "express";
const router = Router();

import {
  allUsers,
  // editUser,
  // deleteUser,
  // withdrawals,
  // approveWithdrawal,
  // declineWithdrawal,
  withdraw,
  // deposits,
  deposit,
  // approveDeposit,
  // declineDeposit,
  getUserTransactions,
  CreateAccountNumber,
  transfer,
} from "../controllers/adminController.js";

router.get("/users", allUsers);

// router.get("/withdrawals", withdrawals);
router.post("/withdraw", withdraw);
// router.post("/withdraw/approve", approveWithdrawal);
// router.post("/withdraw/decline", declineWithdrawal);

// router.get("/deposits", deposits);
router.post("/deposit", deposit);
// router.post("/deposit/approve", approveDeposit);
// router.post("/deposit/decline", declineDeposit);

// router.put("/users/:id", editUser);
router.get("/transactions", getUserTransactions);
router.post("/transfer", transfer)
router.post("/generate", CreateAccountNumber);

// router.post("/deleteuser", deleteUser);

export default router;
