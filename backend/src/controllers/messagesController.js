const pool = require("../config/db"); 

const chatExists = async (chat_id) => {
  const result = await pool.query("SELECT id FROM chats WHERE id = $1", [chat_id]);
  return result.rows.length > 0;
};

const sendMessage = async (req, res) => {
  try {
    const { chat_id, sender_id, content } = req.body;

    if (!chat_id || !sender_id || !content) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const chatFound = await chatExists(chat_id);
    if (!chatFound) {
      return res.status(404).json({ message: "Chat not found." });
    }
    const newMessage = await pool.query(
      "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
      [chat_id, sender_id, content]
    );

    res.status(201).json(newMessage.rows[0]);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMessagesByChat = async (req, res) => {
  try {
    const { chat_id } = req.params;

    const chatFound = await chatExists(chat_id);
    if (!chatFound) {
      return res.status(404).json({ message: "Chat not found." });
    }

    const messages = await pool.query(
      "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
      [chat_id]
    );

    await pool.query(
      "UPDATE messages SET is_read = true WHERE chat_id = $1",
      [chat_id]
    );

    res.status(200).json(messages.rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  sendMessage,
  getMessagesByChat,
};
