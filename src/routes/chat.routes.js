import jwt from "jsonwebtoken";
import { Router } from "express";
import {
  addUserChat,
  getChats,
  getMembers,
  getMessages,
  startChat,
} from "../controllers/chatController.js";

export const router = Router();

const auth = async (req, res, next) => {
  const headers = req.headers.authorization;

  if (!headers)
    return res.status(401).json({ message: "Faltan datos de autenticación" });

  const [type, token] = headers.split(" ");

  if (type != "bearer" || !token)
    return res.status(401).json({ message: "Faltan datos de autenticación" });

  try {
    const payload = jwt.verify(token, process.env.SECRET);

    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Credenciales invalidas" });
  }
};

router.get("/chats", auth, getChats);
router.get("/messages/:id", auth, getMessages);
router.get("/members/:id", auth, getMembers);
router.post("/chat", auth, startChat);
router.post("/addUserChat", auth, addUserChat);
export default router;
