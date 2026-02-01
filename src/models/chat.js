import pool from "../../db.js";

class Chat {
  constructor({ id, name, description, isgroup }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isGroup = isgroup;
  }

  static getChats = async (userId) => {
    if (userId == NaN) throw new Error("Error id de usuario");

    const { rows } = await pool.query(
      "SELECT c.id, c.isGroup, c.description, CASE WHEN c.isGroup = true THEN c.name ELSE u.username END AS name FROM chats c JOIN members m ON m.chatId = c.id LEFT JOIN members m2 ON m2.chatId = c.id AND m2.userId <> $1 LEFT JOIN users u ON u.id = m2.userId WHERE m.userId = $1;",
      [userId],
    );

    return rows.map((chat) => new Chat(chat));
  };

  static getChatbyId = async (id) => {
    if (id !== NaN) throw new Error("Error id de usuario");

    const { rows } = await pool.query("SELECT * FROM chats WHERE id = $1", [
      id,
    ]);

    return rows[0] ? new Chat(rows[0]) : null;
  };

  static userChatExistsById = async (userId, friendId) => {
    const { rows } = await pool.query(
      "SELECT c.id FROM chats c JOIN members m ON m.chatId = c.id WHERE c.isGroup = false AND m.userId IN ($1, $2) GROUP BY c.id HAVING COUNT(DISTINCT m.userId) = 2;",
      [userId, friendId],
    );
    console.log(rows);
    return rows[0] ? new Chat(rows[0]) : null;
  };

  save = async () => {
    if (this.isGroup && (!this.name.trim() || !this.description.trim()))
      throw new Error("Faltan datos");

    if (!this.description.trim()) this.description = "";

    const { rows } = await pool.query(
      "INSERT INTO chats(name, description, isGroup) values ($1, $2, $3) RETURNING id",
      [this.name, this.description, this.isGroup],
    );

    if (!rows[0]) throw new Error("Error al crear un chat");

    this.id = rows[0].id;
    return rows[0] ? this : null;
  };
}

export default Chat;
