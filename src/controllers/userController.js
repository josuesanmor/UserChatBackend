import jwt from "jsonwebtoken";
import User from "../models/users.js";
import bcrypt from "bcrypt";

export const firstAuth = async (req, res) => {
  const headers = req.headers.authorization;

  if (!headers)
    return res.status(401).json({ message: "Faltan datos de autenticación" });

  const [type, token] = headers.split(" ");

  if (type != "bearer" || !token)
    return res.status(401).json({ message: "Faltan datos de autenticación" });

  try {
    const payload = jwt.verify(token, process.env.SECRET);

    const newToken = jwt.sign({ userId: payload.userId }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.json({ ok: true, token: newToken, id: payload.userId });
  } catch (error) {
    res.status(403).json({ message: "Sesion expirada" });
  }
};

export const userLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) res.json({ message: "Faltan datos" });

  try {
    const user = await User.userExists(username);
    if (!user) throw new Error("El usuario no existe");

    const psw = await bcrypt.compare(password, user.password);

    if (!psw) throw new Error("La contraseña es incorrecta");

    const token = jwt.sign({ userId: user.id }, process.env.SECRET, {
      expiresIn: "7d",
    });

    res.json({ ok: true, token: token, id: user.id });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export const userRegister = async (req, res) => {
  const { username, password } = req.body;

  if (!username.trim() || !password.trim())
    return res.json({ message: "Faltan datos" });

  const user = await User.userExists(username);
  if (user) return res.json({ message: "El usuario ya existe" });

  const cryptedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ username: username, password: cryptedPassword });
    const response = await newUser.save();

    if (!response)
      return res
        .stauts(500)
        .json({ message: "Ocurrio un error al crear al usuario" });

    res.json({ ok: true, message: "Creado con exito" });
  } catch (error) {
    res.json(error.message);
  }
};

export const userExists = async (req, res) => {
  const username = req.params.username;

  if (!username) return res.json({ message: "Faltan datos" });

  const user = await User.userExists(username);

  res.json({ ok: true, exists: user });
};

export default { firstAuth, userLogin, userRegister, userExists };
