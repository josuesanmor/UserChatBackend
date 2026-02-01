import pool from "../../db.js";

class Message {
  constructor({ id, userid, chatid, content, messagedate }) {
    this.id = id;
    this.userid = userid;
    this.chatid = chatid;
    this.content = content;
    this.date = messagedate;
  }

  static getMessages = async (chatId, userId, limit = 30, offset = 0) => {
    if (chatId == NaN || userId == NaN) throw new Error("Error id de chat");

    const { rows } = await pool.query(
      "SELECT m.userId, m.content, m.messageDate FROM messages m JOIN members me ON me.chatId = m.chatId WHERE m.chatId = $1 AND me.userId = $2 ORDER BY messageDate ASC limit $3 OFFSET $4",
      [chatId, userId, limit, offset],
    );

    return rows.map((message) => new Message(message));
  };

  send = async () => {
    if (this.userId == NaN || this.chatId == NaN || !this.content.trim())
      throw new Error("Faltan datos");

    const { rowCount } = await pool.query(
      "INSERT INTO messages(userId, chatId, content) values ($1, $2, $3) RETURNING *",
      [this.userid, this.chatid, this.content],
    );

    return rowCount ? this : null;
  };
}

export default Message;
