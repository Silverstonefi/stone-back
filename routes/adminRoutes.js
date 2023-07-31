import { Router } from "express";
const router = Router();

import {
  allUsers,
  editUser,
  deleteUser,
  withdrawals,
  withdraw,
  deposits,
  deposit,
  getUserTransactions,
  transfer,
  trasnferx,
  approval,
  approveTransfer,
} from "../controllers/adminController.js";

router.get("/users", allUsers);

router.get("/withdrawals", withdrawals);
router.post("/withdraw", withdraw);
// router.post("/withdraw/approve", approveWithdrawal);
// router.post("/withdraw/decline", declineWithdrawal);

router.get("/deposits", deposits);
router.post("/deposit", deposit);
// router.post("/deposit/approve", approveDeposit);
// router.post("/deposit/decline", declineDeposit);

router.put("/users/:id", editUser);
router.post("/transactions", getUserTransactions);
router.post("/transfer", transfer);
router.post("/transferx", trasnferx);
router.put("/transfer/approve/:transferId", approveTransfer);
// router.post("/generate", CreateAccountNumber);

router.post("/deleteuser", deleteUser);

export default router;
