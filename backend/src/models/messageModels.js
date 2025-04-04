const pool = require("../config/db");

// Check if chat exists
const chatExists = async (chat_id) => {
  const result = await pool.query("SELECT id FROM chats WHERE id = $1", [chat_id]);
  return result.rows.length > 0;
};

// Insert a new message
const insertMessage = async (chat_id, sender_id, content) => {
  const result = await pool.query(
    "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
    [chat_id, sender_id, content]
  );
  return result.rows[0];
};

// Get all messages of a chat
const getMessages = async (chat_id) => {
  const result = await pool.query(
    "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
    [chat_id]
  );
  return result.rows;
};

// Mark messages as read
const markMessagesAsRead = async (chat_id) => {
  await pool.query("UPDATE messages SET is_read = true WHERE chat_id = $1", [chat_id]);
};

module.exports = {
  chatExists,
  insertMessage,
  getMessages,
  markMessagesAsRead,
};
