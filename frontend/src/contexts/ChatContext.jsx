"use client"

import { createContext, useState, useContext, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"
import { useSocket } from "./SocketProvider"

const ChatContext = createContext()

export const useChat = () => useContext(ChatContext)

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const { socket, connected } = useSocket()

  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [chatUsers, setChatUsers] = useState({})
  const [unreadMessages, setUnreadMessages] = useState({}) // chatId -> count
  const [typingUsers, setTypingUsers] = useState({}) // chatId -> Set of userIds who are typing

  // Keep track of joined rooms
  const joinedRooms = useRef(new Set())

  // Debug logging
  const debugLog = useCallback((message, data = null) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    console.log(`[${timestamp}] [Chat] ${message}`, data || "")
  }, [])

  // Debug user authentication status
  useEffect(() => {
    debugLog("Auth status:", {
      isAuthenticated,
      userId: user?.id,
      userObject: user,
    })
  }, [isAuthenticated, user, debugLog])

  // Join all chat rooms when socket connects or chats change
  useEffect(() => {
    if (!socket || !connected || !isAuthenticated || !user?.id || chats.length === 0) return

    debugLog("Joining all chat rooms...")

    // Join personal room using userId
    const userRoomId = user.id.toString()
    socket.emit("joinRoom", userRoomId)
    debugLog(`Joined personal room: ${userRoomId}`)

    // Join all chat rooms the user is part of
    chats.forEach((chat) => {
      const roomId = chat.id.toString()
      if (!joinedRooms.current.has(roomId)) {
        debugLog(`Joining room: ${roomId}`)
        socket.emit("joinRoom", roomId)
        joinedRooms.current.add(roomId)

        // Also explicitly request to join with userId for server tracking
        socket.emit("joinChatRoom", {
          chatId: roomId,
          userId: user.id,
        })
      }
    })

    return () => {
      // Clean up joined rooms on unmount
      joinedRooms.current.forEach((roomId) => {
        debugLog(`Leaving room: ${roomId}`)
        socket.emit("leaveRoom", roomId)
      })
      joinedRooms.current.clear()
    }
  }, [socket, connected, isAuthenticated, chats, user, debugLog])

  // Listen for socket events
  useEffect(() => {
    if (!socket || !connected) return

    debugLog("Setting up socket listeners")

    const handleNewMessage = (newMessage) => {
      debugLog("Socket received new message:", newMessage)

      // Add sender info if missing
      if (!newMessage.sender && newMessage.sender_id) {
        const sender = chatUsers[newMessage.sender_id]
        if (sender) {
          newMessage = { ...newMessage, sender }
        }
      }

      // Update messages if we're in the current chat
      if (currentChat && newMessage.chat_id === currentChat.id) {
        debugLog("Updating messages for current chat")
        setMessages((prevMessages) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(
            (msg) =>
              msg.id === newMessage.id ||
              (typeof msg.id === "string" &&
                msg.id.startsWith("temp-") &&
                msg.content === newMessage.content &&
                msg.sender_id === newMessage.sender_id),
          )

          if (messageExists) {
            debugLog("Message already exists, not adding duplicate")
            return prevMessages.map((msg) =>
              // If this is a temp message that matches our new message, replace it
              typeof msg.id === "string" &&
              msg.id.startsWith("temp-") &&
              msg.content === newMessage.content &&
              msg.sender_id === newMessage.sender_id
                ? { ...newMessage, sender: msg.sender || newMessage.sender }
                : msg,
            )
          }

          return [...prevMessages, newMessage]
        })
      } else {
        // If not in the current chat, increment unread count
        if (newMessage.sender_id !== user?.id) {
          debugLog(`Incrementing unread count for chat ${newMessage.chat_id}`)
          setUnreadMessages((prev) => ({
            ...prev,
            [newMessage.chat_id]: (prev[newMessage.chat_id] || 0) + 1,
          }))
        }
      }

      // Always update the chat list with the last message
      updateChatWithLastMessage(newMessage)
    }

    // Listen for new messages
    socket.on("receiveMessage", handleNewMessage)
    socket.on("newMessage", handleNewMessage)

    // Listen for new chats
    socket.on("newChatAdded", (chat) => {
      debugLog("Received new chat notification:", chat)

      // Add to chat list if not already there
      setChats((prev) => {
        const chatExists = prev.some((c) => c.id === chat.id)
        if (chatExists) {
          debugLog("Chat already exists, updating it")
          return prev.map((c) => (c.id === chat.id ? chat : c))
        }
        debugLog("Adding new chat to list")
        return [chat, ...prev]
      })

      // Extract user info from the new chat
      if (chat.members || chat.participants) {
        const members = chat.members || chat.participants || []
        setChatUsers((prev) => {
          const newUsers = { ...prev }
          members.forEach((member) => {
            newUsers[member.id] = member
          })
          return newUsers
        })
      }

      // Join the chat room
      const roomId = chat.id.toString()
      socket.emit("joinRoom", roomId)
      joinedRooms.current.add(roomId)
      socket.emit("joinChatRoom", { chatId: roomId, userId: user.id })
      debugLog(`Joined room for new chat: ${roomId}`)
    })

    // Listen for chat updates
    socket.on("chatUpdated", (updatedChat) => {
      debugLog("Chat updated:", updatedChat)
      setChats((prev) => prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)))
    })

    // Listen for typing status
    socket.on("userTyping", ({ chatId, userId, isTyping }) => {
      debugLog(`User ${userId} is ${isTyping ? "typing" : "not typing"} in chat ${chatId}`)

      setTypingUsers((prev) => {
        const updatedTyping = { ...prev }

        if (!updatedTyping[chatId]) {
          updatedTyping[chatId] = new Set()
        }

        if (isTyping) {
          updatedTyping[chatId].add(userId)
        } else {
          updatedTyping[chatId].delete(userId)
        }

        return updatedTyping
      })
    })

    // Debug events
    socket.on("debug", (message) => {
      debugLog("Server debug:", message)
    })

    socket.on("error", (error) => {
      debugLog("Socket error:", error)
    })

    return () => {
      debugLog("Cleaning up socket listeners")
      socket.off("receiveMessage", handleNewMessage)
      socket.off("newMessage", handleNewMessage)
      socket.off("newChatAdded")
      socket.off("chatUpdated")
      socket.off("userTyping")
      socket.off("debug")
      socket.off("error")
    }
  }, [socket, connected, currentChat, chatUsers, user, debugLog])

  // Update chat with last message
  const updateChatWithLastMessage = useCallback(
    (message) => {
      debugLog(`Updating last message for chat ${message.chat_id}`)
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === message.chat_id ? { ...chat, last_message: message } : chat)),
      )
    },
    [debugLog],
  )

  // Fetch chats
  const fetchChats = useCallback(async () => {
    if (!isAuthenticated) {
      debugLog("Not authenticated, skipping fetchChats")
      return
    }

    setLoading(true)
    try {
      debugLog("Fetching chats...")
      const res = await axios.get("http://localhost:5000/api/chats/get")
      debugLog("Chats fetched:", res.data)
      setChats(res.data)

      // Extract and store user info from chats
      const users = {}
      res.data.forEach((chat) => {
        // Handle both members and participants fields
        const members = chat.members || chat.participants || []
        members.forEach((member) => {
          users[member.id] = member
        })
      })
      setChatUsers(users)

      // Make sure we join all chat rooms
      if (socket && connected) {
        res.data.forEach((chat) => {
          const roomId = chat.id.toString()
          if (!joinedRooms.current.has(roomId)) {
            debugLog(`Joining room after fetch: ${roomId}`)
            socket.emit("joinRoom", roomId)
            socket.emit("joinChatRoom", { chatId: roomId, userId: user.id })
            joinedRooms.current.add(roomId)
          }
        })
      }
    } catch (error) {
      debugLog("Error fetching chats:", error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, socket, connected, user, debugLog])

  // Fetch messages for a chat
  const fetchMessages = useCallback(
    async (chatId) => {
      if (!isAuthenticated) {
        debugLog("Not authenticated, skipping fetchMessages")
        return
      }

      setLoading(true)
      try {
        debugLog(`Fetching messages for chat ${chatId}...`)
        const res = await axios.get(`http://localhost:5000/api/messages/${chatId}/0`)
        debugLog("Messages fetched:", res.data)
        setMessages(res.data)

        // Reset unread count for this chat
        setUnreadMessages((prev) => ({
          ...prev,
          [chatId]: 0,
        }))

        // Make sure we're joined to this chat room
        if (socket && connected && !joinedRooms.current.has(chatId.toString())) {
          debugLog(`Joining room during message fetch: ${chatId}`)
          socket.emit("joinRoom", chatId.toString())
          socket.emit("joinChatRoom", { chatId: chatId.toString(), userId: user.id })
          joinedRooms.current.add(chatId.toString())
        }
      } catch (error) {
        debugLog("Error fetching messages:", error.response?.data || error.message)
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, socket, connected, user, debugLog],
  )

  // Send a message
  const sendMessage = async (content) => {
    if (!currentChat) {
      debugLog("No current chat selected")
      return
    }

    if (!user) {
      debugLog("User not authenticated")
      return
    }

    // Create a temporary message for immediate display
    const tempMessage = {
      id: `temp-${Date.now()}`,
      chat_id: currentChat.id,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      sender: user, // Add sender info for UI
      pending: true, // Mark as pending
    }

    try {
      // Verify we have all required data
      debugLog("Sending message with data:", {
        chat_id: currentChat.id,
        content,
        user_id: user.id,
        token_present: !!axios.defaults.headers.common["Authorization"],
      })

      // Add to messages immediately for better UX
      setMessages((prev) => [...prev, tempMessage])

      // Send to server
      const res = await axios.post("http://localhost:5000/api/messages/send", {
        chat_id: currentChat.id,
        content,
      })

      debugLog("Message sent successfully, response:", res.data)

      // Replace temp message with real one
      setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? { ...res.data, sender: user } : msg)))

      // Update the last message in chat list
      updateChatWithLastMessage({ ...res.data, sender: user })

      // Explicitly emit a socket event to notify other users
      if (socket && connected) {
        debugLog("Emitting sendMessage event to server")
        socket.emit("sendMessage", {
          ...res.data,
          sender: {
            id: user.id,
            username: user.username,
            profile_pic: user.profile_pic,
          },
        })
      }

      return res.data
    } catch (error) {
      debugLog("Error sending message:", error.response?.data || error.message)

      // Mark the temp message as failed
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? { ...msg, failed: true, pending: false } : msg)),
      )

      throw error
    }
  }

  // Create a private chat with another user
  const createPrivateChat = async (userId2) => {
    if (!isAuthenticated) {
      debugLog("Not authenticated, cannot create private chat")
      return
    }

    try {
      debugLog("Creating private chat with user:", userId2)

      // Create the chat via API
      const res = await axios.post("http://localhost:5000/api/chats/private", { userId2 })
      const newChat = res.data
      debugLog("Private chat created or retrieved:", newChat)

      // Update local state
      setChats((prev) => {
        const chatExists = prev.some((chat) => chat.id === newChat.id)
        if (chatExists) {
          return prev.map((chat) => (chat.id === newChat.id ? newChat : chat))
        }
        return [newChat, ...prev]
      })

      // Extract user info from the new chat
      if (newChat.members || newChat.participants) {
        const members = newChat.members || newChat.participants || []
        setChatUsers((prev) => {
          const newUsers = { ...prev }
          members.forEach((member) => {
            newUsers[member.id] = member
          })
          return newUsers
        })
      }

      // Join the new chat room
      if (socket && connected) {
        const roomId = newChat.id.toString()
        debugLog(`Joining room for new private chat: ${roomId}`)
        socket.emit("joinRoom", roomId)
        socket.emit("joinChatRoom", { chatId: roomId, userId: user.id })
        joinedRooms.current.add(roomId)

        // Notify the server about the new chat with complete chat data
        socket.emit("createPrivateChat", {
          user1Id: user.id,
          user2Id: userId2,
          chatData: newChat, // Send the complete chat data
        })
      }

      // Select the new chat
      setCurrentChat(newChat)
      fetchMessages(newChat.id)

      return newChat
    } catch (error) {
      debugLog("Error creating private chat:", error.response?.data || error.message)
      throw error
    }
  }

  // Create a group chat
  const createGroupChat = async (name, members) => {
    if (!isAuthenticated) {
      debugLog("Not authenticated, cannot create group chat")
      return
    }

    try {
      debugLog("Creating group chat:", { name, members })

      // Ensure members is an array of IDs
      const memberIds = Array.isArray(members) ? members : [members]

      // Create the chat via API
      const res = await axios.post("http://localhost:5000/api/chats/group", {
        name,
        isGroup: true,
        members: memberIds,
      })

      const newChat = res.data
      debugLog("Group chat created:", newChat)

      // Add to chat list
      setChats((prev) => [newChat, ...prev])

      // Extract user info from the new chat
      if (newChat.members || newChat.participants) {
        const members = newChat.members || newChat.participants || []
        setChatUsers((prev) => {
          const newUsers = { ...prev }
          members.forEach((member) => {
            newUsers[member.id] = member
          })
          return newUsers
        })
      }

      // Join the new chat room
      if (socket && connected) {
        const roomId = newChat.id.toString()
        debugLog(`Joining room for new group chat: ${roomId}`)
        socket.emit("joinRoom", roomId)
        socket.emit("joinChatRoom", { chatId: roomId, userId: user.id })
        joinedRooms.current.add(roomId)

        // Notify the server about the new chat
        socket.emit("newGroupChatCreated", {
          chatId: roomId,
          participants: (newChat.members || newChat.participants || []).map((p) => p.id),
          chatData: newChat,
        })
      }

      // Select the new chat
      setCurrentChat(newChat)
      fetchMessages(newChat.id)

      return newChat
    } catch (error) {
      debugLog("Error creating group chat:", error)
      throw error
    }
  }

  // Set typing status
  const setTypingStatus = useCallback(
    (isTyping) => {
      if (!currentChat || !socket || !connected || !user) return

      socket.emit("typing", {
        chatId: currentChat.id,
        userId: user.id,
        isTyping,
      })
    },
    [currentChat, socket, connected, user],
  )

  // Get typing users for current chat
  const getTypingUsers = useCallback(() => {
    if (!currentChat || !typingUsers[currentChat.id]) return []

    // Convert Set to Array and filter out current user
    return Array.from(typingUsers[currentChat.id])
      .filter((id) => id !== user?.id)
      .map((id) => chatUsers[id])
      .filter(Boolean) // Remove undefined users
  }, [currentChat, typingUsers, user, chatUsers])

  // Get unread count for a chat
  const getUnreadCount = useCallback(
    (chatId) => {
      return unreadMessages[chatId] || 0
    },
    [unreadMessages],
  )

  // Set current chat and fetch its messages
  const selectChat = useCallback(
    (chat) => {
      debugLog("Selecting chat:", chat)
      setCurrentChat(chat)

      if (chat) {
        fetchMessages(chat.id)
      } else {
        setMessages([])
      }
    },
    [fetchMessages, debugLog],
  )

  // Get other user in a private chat
  const getOtherUser = useCallback(
    (chat) => {
      if (!chat || !user) return null

      // Handle both members and participants fields
      const members = chat.members || chat.participants || []
      return members.find((m) => m.id !== user.id)
    },
    [user],
  )

  // Provide the context value
  const value = {
    chats,
    setChats,
    currentChat,
    setCurrentChat: selectChat,
    messages,
    setMessages,
    loading,
    fetchChats,
    fetchMessages,
    sendMessage,
    createGroupChat,
    createPrivateChat,
    chatUsers,
    getUnreadCount,
    setTypingStatus,
    getTypingUsers,
    getOtherUser,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
