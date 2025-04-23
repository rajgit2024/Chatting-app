import React, { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"
import { useSocket } from "./SocketProvider"

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const { user, isAuthenticated } = useAuth()
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on("new_message", (newMessage) => {
      if (currentChat && newMessage.chat_id === currentChat.id) {
        setMessages((prev) => [...prev, newMessage])
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === newMessage.chat_id
            ? { ...chat, last_message: newMessage }
            : chat
        )
      )
    })

    return () => {
      socket.off("new_message")
    }
  }, [socket, currentChat])

  useEffect(() => {
    if (isAuthenticated) {
      fetchChats()
    }
  }, [isAuthenticated])

  const fetchChats = async () => {
    if (!isAuthenticated) return;
  
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/chats/get");
      const data = res.data;
  
      console.log("Fetched chats:", data); // <-- This should be an array
  
      if (Array.isArray(data)) {
        setChats(data); 
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchMessages = async (chatId) => {
    if (!isAuthenticated) return

    setLoading(true)
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${chatId}/0`)
      setMessages(res.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content) => {
    if (!currentChat || !user) return

    try {
      await axios.post("http://localhost:5000/api/messages/send", {
        chat_id: currentChat.id,
        content,
      })
      // Message will be handled via socket
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  const createPrivateChat = async (userId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/chats/private", { user_id: userId })
      const newChat = res.data

      setChats((prev) => {
        if (!prev.find((chat) => chat.id === newChat.id)) {
          return [...prev, newChat]
        }
        return prev
      })

      return newChat
    } catch (error) {
      console.error("Error creating private chat:", error)
      throw error
    }
  }

  const createGroupChat = async (name,members) => {
    try {
      const res = await axios.post("http://localhost:5000/api/chats/group", {
        name,
        isGroup:true,
        members,
      })
      return res.data
    } catch (error) {
      console.error("Error creating group chat:", error)
      throw error
    }
  }

  const value = {
    chats,
    currentChat,
    messages,
    loading,
    sendMessage,
    fetchChats,
    fetchMessages,
    setCurrentChat,
    createPrivateChat,
    createGroupChat,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
