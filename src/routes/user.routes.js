import { Router } from "express";
import {
  firstAuth,
  userLogin,
  userRegister,
  userExists,
} from "../controllers/userController.js";

export const router = Router();

router.post("/firstauth", firstAuth);
router.post("/login", userLogin);
router.post("/register", userRegister);
router.get("/user/:username", userExists);

export default router;
