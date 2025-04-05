import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const ChatApp = () => {
  const [userId, setUserId] = useState(1);
  const [chatId, setChatId] = useState(1);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const socket = useRef();

  // Connect socket only once
  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.emit("userConnected", userId);

    return () => {
      socket.current.disconnect();
    };
  }, [userId]);

  // Join selected chat room
  useEffect(() => {
    if (chatId && socket.current) {
      socket.current.emit("joinChat", chatId);
      fetchMessages(chatId);
    }
  }, [chatId]);

  // Listen for real-time messages
  useEffect(() => {
    const handleReceive = (message) => {
      if (message.chat_id === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.current?.on("receiveMessage", handleReceive);

    return () => {
      socket.current?.off("receiveMessage", handleReceive);
    };
  }, [chatId]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chats/${userId}`);
      setChats(res.data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const fetchMessages = async (chatIdToFetch) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${chatIdToFetch}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/messages/send", {
        chat_id: chatId,
        sender_id: userId,
        content: newMessage,
      });

      // We won't add the message locally here — it will come through the socket
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId) fetchChats();
  }, [userId]);

  return (
    <div className="chat-container">
      <div className="chat-list">
        {chats.map((chat) => (
          <div key={chat.id} onClick={() => setChatId(chat.id)} style={{ cursor: "pointer" }}>
            <h4>Chat #{chat.id}</h4>
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
