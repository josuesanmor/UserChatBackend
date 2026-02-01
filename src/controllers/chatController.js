import Chat from "../models/chat.js";
import Message from "../models/message.js";
import User from "../models/users.js";
import Member from "../models/member.js";

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.getChats(req.userId);

    res.json({ ok: true, chats: chats });
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const chatId = req.params.id;

  if (!chatId) return res.json({ message: "Faltan datos" });

  try {
    const chat = await Message.getMessages(chatId, req.userId, 30, 0);

    res.json({ ok: true, chat: chat });
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const getMembers = async (req, res) => {
  const chatId = req.params.id;

  if (!chatId) return res.json({ message: "Faltan datos" });

  try {
    const members = await User.getMembers(req.userId, chatId);

    res.json({ ok: true, members: members });
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const startChat = async (req, res) => {
  let { friendId, isGroup, name, description } = req.body;

  if (isGroup && (!name.trim() || !description.trim()))
    return res.json({ message: "Faltan datos" });

  if (!isGroup) name = description = "";

  if (friendId == req.userId)
    return res.json({
      same: true,
      message: "No puedes agregarte a ti",
    });

  try {
    const chat = new Chat({
      name: name,
      description: description,
      isgroup: isGroup,
    });

    if (friendId) {
      const friendExists = await Chat.userChatExistsById(req.userId, friendId);
      if (friendExists)
        return res.json({ ok: false, message: "El usuario ya esta agregado" });
    }

    if (!(await chat.save()))
      res.json({ message: "No se pudo iniciar el chat" });

    const addMe = await Member.addMember(req.userId, chat.id);
    if (!addMe) res.json({ message: "No se pudo crear el chat" });

    if (friendId) {
      const addFriend = await Member.addMember(friendId, chat.id);
      if (!addFriend) res.json({ message: "No se pudo crear el chat" });
    }

    res.json({ ok: true, chat: chat });
  } catch (error) {
    return res.json({ message: error.message });
  }
};

export const addUserChat = async (req, res) => {
  const { friendId, chatId } = req.body;

  if (
    friendId == NaN ||
    chatId == NaN ||
    friendId == undefined ||
    chatId == undefined
  )
    return res.json({ message: "Datos invalidos" });

  if (friendId == req.userId)
    return res.json({
      same: true,
      message: "Ya estas en el grupo! >:V perroh",
    });

  if (!(await Member.isMember(req.userId, chatId)))
    return res.json({ message: "No eri miembro" });

  if (await Member.isMember(friendId, chatId))
    return res.json({ already: true, message: "ya eh miembro" });

  const addFriend = await Member.addMember(friendId, chatId);
  if (!addFriend) return res.json({ message: "Ocurrio un error" });

  res.json({ ok: true, message: "Usuario agregado" });
};
