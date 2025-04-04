const {
  chatExists,
  insertMessage,
  getMessages,
  markMessagesAsRead,
} = require("../models/messageModels.js");

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

    const newMessage = await insertMessage(chat_id, sender_id, content);
    res.status(201).json(newMessage);
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

    const messages = await getMessages(chat_id);
    await markMessagesAsRead(chat_id);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  sendMessage,
  getMessagesByChat,
};
