import Member from "../models/member.js";
import Message from "../models/message.js";

export const socketController = (socket, io) => {
  console.log("Conectado");

  socket.on("message", async ({ chatId, data }) => {
    const msg = new Message({
      userid: socket.userId,
      chatid: chatId,
      content: data,
    });

    try {
      if (await msg.send()) io.to(`chat:${chatId}`).emit("message", msg);
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("join", async (chatId) => {
    const isMember = await Member.isMember(socket.userId, chatId);

    if (!isMember) return;

    socket.join(`chat:${chatId}`);
  });

  socket.on("leave", (chatId) => {
    socket.leave(`chat:${chatId}`);
  });
};
