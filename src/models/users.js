import pool from "../../db.js";

class User {
  constructor({ id, username, password }) {
    this.id = id;
    this.username = username;
    this.password = password;
  }

  static userExists = async (username) => {
    if (!username.trim()) throw new Error("Datos faltantes");

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
      [username],
    );

    return rows[0] ? new User(rows[0]) : null;
  };

  async save() {
    if (!this.username.trim() || !this.password.trim())
      throw new Error("Datos faltantes");

    const { rowCount } = await pool.query(
      "INSERT INTO users(username, password) VALUES ($1, $2)",
      [this.username, this.password],
    );

    return rowCount ? this : null;
  }

  static getMembers = async (userId, chatId) => {
    if (chatId == NaN || userId == NaN) throw new Error("Error id de chat");

    const { rows } = await pool.query(
      "SELECT u.id, u.username FROM users u JOIN members me ON me.userId = u.id AND me.chatId = $1 WHERE EXISTS (SELECT 1 FROM members me WHERE me.userId = $2 AND me.chatId = $1)",
      [chatId, userId],
    );

    return rows.map((member) => new User(member));
  };
}

export default User;
