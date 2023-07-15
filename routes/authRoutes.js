import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

router.post("/sign-up", authController.signup);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.post("/profile", authController.editProfile);

router.post("/get-profile", authController.getProfile);

router.post("/address", authController.editAccount);

router.post("/forgot-password/:log", authController.sendPassword);

// router.get("/activate/:email", authController.activateUser);

router.post("/changePassword", authController.changePassword);

// router.post("/user", authController.user);

// router.post("/forgot-password/:log", authController.sendPassword);

// router.post("/withdraw", authController.withdraw);

// router.post("/deposit", authController.deposit);

// router.post("/changePassword", authController.changePassword);

// router.post("/profile", authController.profile);

export default router;
