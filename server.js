import express from "express";
import http from "http";
import { Server as websocket } from "socket.io";
import cors from "cors";
import { router as userRoutes } from "./src/routes/user.routes.js";
import { router as chatRoutes } from "./src/routes/chat.routes.js";
import { socketController } from "./src/controllers/socketController.js";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const corsOptions = { origin: "*" };

const app = express();
const server = http.createServer(app);
const io = new websocket(server, { cors: { origin: corsOptions.origin } });

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const payload = jwt.verify(token, process.env.SECRET);

    socket.userId = payload.userId;
    next();
  } catch (error) {
    next(new Error("Credenciales invalidas"));
  }
});

io.on("connection", (socket) => socketController(socket, io));

app.use(express.json());
app.use(cors(corsOptions));
app.use(userRoutes);
app.use(chatRoutes);

const port = process.env.PORT;
//const host = "192.168.100.10";
const host = process.env.HOST;
server.listen(port, host, console.log(`Servidor en puerto ${port}`));
