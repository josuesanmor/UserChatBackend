import pool from "../../db.js";

class Member {
  constructor({ userid, chatid }) {
    this.userId = userid;
    this.chatId = chatid;
  }

  static isMember = async (userId, chatId) => {
    if (userId == NaN || chatId == NaN) throw new Error("Error id de usuario");

    const { rows } = await pool.query(
      "SELECT * FROM members WHERE userId = $1 AND chatId = $2",
      [userId, chatId],
    );

    return rows[0] ? new Member(rows[0]) : null;
  };

  static getMemberships = async (userId) => {
    if (userId == NaN) throw new Error("Error id de usuario");

    const { rows } = await pool.query(
      "SELECT * FROM members WHERE userId = $1",
      [userId],
    );

    return rows.map((member) => new Member(member));
  };

  static addMember = async (userId, chatId) => {
    if (userId == NaN || chatId == NaN) throw new Error("Faltan datos");

    const { rowCount } = await pool.query(
      "INSERT INTO members(userId, chatId) values ($1, $2) RETURNING *",
      [userId, chatId],
    );

    return rowCount ? this : null;
  };
}

export default Member;
