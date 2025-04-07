import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const ChatApp = () => {
  const [userId, setUserId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Emit only once when userId is set
  useEffect(() => {
    if (userId) {
      fetchChats();
      socket.emit("userConnected", userId);
    }
  }, [userId]);

  // Fetch messages only when chatId is updated
  useEffect(() => {
    if (chatId) {
      fetchMessages();
      socket.emit("joinChat", chatId);
    }
  }, [chatId]);

  // Clean socket and listen only once per chatId
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (message.chat_id === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [chatId]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chats/${userId}`);
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${chatId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
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

      socket.emit("sendMessage", res.data);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // UI to enter User ID initially
  if (!userId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Enter Your User ID</h2>
          <input
            type="number"
            placeholder="User ID"
            className="border p-2 rounded w-full mb-3"
            onChange={(e) => setUserId(Number(e.target.value))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 h-screen bg-gray-100">
      <div className="col-span-1 bg-white p-4 border-r shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setChatId(chat.id)}
            className={`p-3 rounded-lg cursor-pointer mb-2 ${
              chatId === chat.id ? "bg-blue-100" : "hover:bg-gray-200"
            }`}
          >
            <span className="text-gray-800 font-medium">
              {chat.name || "Private Chat"}
            </span>
          </div>
        ))}
      </div>

      <div className="col-span-3 flex flex-col h-full">
        <div className="bg-white shadow-md px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-700">
            {chatId ? `Chat Room #${chatId}` : "Select a chat to start messaging"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg shadow text-white text-sm ${
                  msg.sender_id === userId ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span>{msg.content}</span>
              </div>
            </div>
          ))}
        </div>

        {chatId && (
          <div className="p-4 bg-white border-t shadow-md flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
