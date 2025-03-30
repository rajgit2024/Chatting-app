const pool = require("../config/db");

// ✅ Check if Chat Exists
const chatExists = async (chat_id) => {
  const result = await pool.query("SELECT id FROM chats WHERE id = $1", [chat_id]);
  return result.rows.length > 0; // Returns true if chat exists, false otherwise
};

const createMessage = async (chat_id, sender_id, content) => {
  const result = await pool.query(
    "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
    [chat_id, sender_id, content]
  );
  return result.rows[0];
};

const getMessagesByChatId = async (chat_id) => {
  const result = await pool.query(
    "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
    [chat_id]
  );
  return result.rows;
};

module.exports = {
  chatExists,
  createMessage,
  getMessagesByChatId,
};
