// controllers/messagesController.js
const {
  chatExists,
  insertMessage,
  getMessages,
  markMessagesAsRead,
} = require("../models/messageModels");

const sendMessage = async (req, res) => {
  try {
    const { chat_id, content } = req.body;
    const sender_id = req.user.id;  //  Automatically from JWT user!
    
    if (!chat_id || !content?.trim() || !sender_id) {
      return res.status(400).json({ message: "Chat ID, sender ID and content are required." });
    }

    const chatFound = await chatExists(chat_id);
    if (!chatFound) {
      return res.status(404).json({ message: "Chat not found." });
    }

    const newMessage = await insertMessage(chat_id, sender_id, content);

    // Get Socket.IO instance and emit to chat room
    const io = req.app.get("io");
    if (io) {
      io.to(chat_id.toString()).emit("receiveMessage", newMessage);
      console.log(`Message emitted to chat room: ${chat_id}`);
    } else {
      console.error("Socket.IO instance not found on app");
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


const getMessagesByChat = async (req, res) => {
  try {
    const { chat_id, id } = req.params;

    const chatFound = await chatExists(chat_id);
    if (!chatFound) {
      return res.status(404).json({ message: "Chat not found." });
    }

    const messages = await getMessages(chat_id);
    await markMessagesAsRead(chat_id, id); // Optional enhancement

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { sendMessage, getMessagesByChat };
