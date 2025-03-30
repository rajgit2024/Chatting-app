const pool = require("../config/db");

// 🔹 Find a private chat between two users
const findPrivateChat = async (user1, user2) => {
  try {
    const result = await pool.query(
      `SELECT * FROM chats
        WHERE type = 'private'
        AND id IN (
          SELECT chat_id FROM chat_members WHERE user_id = $1
          INTERSECT
          SELECT chat_id FROM chat_members WHERE user_id = $2
        )`,
      [user1, user2]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error in findPrivateChat model function:", error);
    throw error;
  }
};

// 🔹 Create a new chat (private or group)
const createChat = async (type, name, group_icon, created_by) => {
  try {
    const result = await pool.query(
      `INSERT INTO chats (type, name, group_icon, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [type, name, group_icon, created_by]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error while creating chat:", error);
    throw error;
  }
};

// 🔹 Add members to a chat (for group or private)
const addChatMembers = async (chat_id, user_id, role = 'member') => {
  try {
    const result = await pool.query(
      `INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3)`, 
      [chat_id, user_id, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error while adding chat members", error);
    throw error;
  }
};


// 🔹 Get all chats for a user
const getUserChats = async (user_id) => {
  try {
    const result = await pool.query(
      `SELECT c.* FROM chats c
       JOIN chat_members cm ON c.id = cm.chat_id
       WHERE cm.user_id = $1
       ORDER BY c.created_at DESC`,
      [user_id]
    );
    return result.rows;
  } catch (error) {
    console.error("Error while fetching user chats:", error);
    throw error;
  }
};

module.exports = {
  findPrivateChat,
  createChat,
  addChatMembers,
  getUserChats,
};
