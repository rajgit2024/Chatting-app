import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Connect to WebSocket server

const ChatApp = () => {
  const [userId, setUserId] = useState(1);
  const [chatId, setChatId] = useState(1);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (userId) fetchChats();
    socket.emit("userConnected", userId);
  }, [userId]);

  useEffect(() => {
    if (chatId) fetchMessages();
    socket.emit("joinChat", chatId); // Join chat room for real-time updates
  }, [chatId]);

  useEffect(() => {
    // Listen for new messages in real-time
    socket.on("receiveMessage", (message) => {
      if (message.chat_id === chatId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("receiveMessage"); // Cleanup listener on component unmount
    };
  }, [chatId]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/chats/${userId}`);
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/messages/${chatId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post("http://localhost:5000/messages/send", {
        chat_id: chatId,
        sender_id: userId,
        content: newMessage,
      });

      setMessages((prevMessages) => [...prevMessages, res.data]);
      socket.emit("sendMessage", res.data); // Emit message to WebSocket

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-list">
        {chats.map((chat) => (
          <div key={chat.id} onClick={() => setChatId(chat.id)}>
            {chat.name || "Private Chat"}
          </div>
        ))}
      </div>
      <div className="chat-window">
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <strong>{msg.sender_id === userId ? "You" : "Them"}:</strong> {msg.content}
            </div>
          ))}
        </div>
        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
