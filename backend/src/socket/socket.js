const { Server } = require("socket.io");
const pool = require("../config/db");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When a user joins a chat
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    // When a user sends a message
    socket.on("sendMessage", async (message) => {
      const { chat_id, sender_id, content } = message;

      try {
        const newMessage = await pool.query(
          "INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
          [chat_id, sender_id, content]
        );

        // Broadcast to all users in the chat
        io.to(chat_id).emit("receiveMessage", newMessage.rows[0]);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;
