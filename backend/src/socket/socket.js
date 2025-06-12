const { Server } = require("socket.io")
const pool = require("../config/db")
const { createChat } = require("../controllers/chatController") // Make sure the path is correct

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  })

  const userSockets = new Map() // userId -> socketId
  const socketUsers = new Map() // socketId -> userId
  const chatMembers = new Map() // chatId -> Set of userIds

  // Debug logging
  const debugLog = (message, data = null) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    console.log(`[${timestamp}] [Socket] ${message}`, data || "")
  }

  io.on("connection", (socket) => {
    debugLog(`New socket connection: ${socket.id}`)

    // Get user ID from auth token
    let userId = null
    if (socket.handshake.auth && socket.handshake.auth.user) {
      try {
        userId = socket.handshake.auth.user.id
        debugLog(`Socket ${socket.id} authenticated as user ${userId}`)
      } catch (error) {
        debugLog(`Socket ${socket.id} has invalid auth data`)
      }
    }

    // Handle user identification
    socket.on("identify", (data) => {
      userId = data.userId
      debugLog(`Socket ${socket.id} identified as user ${userId}`)

      // Store the mapping
      userSockets.set(userId.toString(), socket.id)
      socketUsers.set(socket.id, userId.toString())

      // Join a personal room using userId
      socket.join(userId.toString())
      debugLog(`User ${userId} joined personal room ${userId}`)

      // Send debug info to client
      socket.emit("debug", `Identified as user ${userId}`)

      // Send current online status to client
      const onlineUsers = Array.from(userSockets.keys())
      io.emit("onlineUsers", onlineUsers)
    })

    // Handle joining rooms
    socket.on("joinRoom", (roomId) => {
      debugLog(`User ${userId} joining room ${roomId}`)
      socket.join(roomId)
      socket.emit("debug", `Joined room ${roomId}`)
      socket.emit("roomJoined", roomId)
    })

    // Handle joining chat rooms with user tracking
    socket.on("joinChatRoom", ({ chatId, userId }) => {
      debugLog(`User ${userId} joining chat room ${chatId}`)
      socket.join(chatId)

      // Track chat members
      if (!chatMembers.has(chatId)) {
        chatMembers.set(chatId, new Set())
      }
      chatMembers.get(chatId).add(userId.toString())

      socket.emit("debug", `Joined chat room ${chatId} as user ${userId}`)
    })

    // Handle leaving rooms
    socket.on("leaveRoom", (roomId) => {
      debugLog(`User ${userId} leaving room ${roomId}`)
      socket.leave(roomId)

      // Remove from chat members tracking
      if (chatMembers.has(roomId) && userId) {
        chatMembers.get(roomId).delete(userId.toString())
      }
    })

    // Handle new messages
    socket.on("sendMessage", (message) => {
      debugLog(`New message in chat ${message.chat_id} from user ${message.sender_id}`, message)

      // Broadcast to all clients in the room
      socket.to(message.chat_id.toString()).emit("receiveMessage", message)
    })

    // Handle typing status
    socket.on("typing", ({ chatId, userId, isTyping }) => {
      debugLog(`User ${userId} is ${isTyping ? "typing" : "not typing"} in chat ${chatId}`)
      socket.to(chatId.toString()).emit("userTyping", { chatId, userId, isTyping })
    })

    // Handle private chat creation
    socket.on("createPrivateChat", async ({ user1Id, user2Id, chatData }) => {
      try {
        debugLog(`Private chat created between ${user1Id} and ${user2Id}`, chatData)

        // Make sure both IDs are strings for consistency
        const user1IdStr = user1Id.toString()
        const user2IdStr = user2Id.toString()

        // Emit to the other user's personal room
        debugLog(`Emitting newChatAdded to user ${user2IdStr}'s personal room`)
        io.to(user2IdStr).emit("newChatAdded", chatData)

        // Log that we sent the event
        debugLog(`Sent newChatAdded event to room ${user2IdStr}`)

        // Acknowledge success to the sender
        socket.emit("privateChatCreated", { success: true, chat: chatData })
      } catch (err) {
        debugLog(`Error handling private chat creation: ${err.message}`)
        socket.emit("error", { message: "Failed to create private chat" })
      }
    })

    // Handle group chat creation
    socket.on("newGroupChatCreated", ({ chatId, participants, chatData }) => {
      debugLog(`New group chat created: ${chatId} with participants`, participants)

      // Track chat members
      if (!chatMembers.has(chatId)) {
        chatMembers.set(chatId, new Set(participants.map((p) => p.toString())))
      } else {
        participants.forEach((p) => chatMembers.get(chatId).add(p.toString()))
      }

      // Notify all participants except the creator
      participants.forEach((participantId) => {
        const participantIdStr = participantId.toString()
        if (participantIdStr !== userId?.toString()) {
          debugLog(`Notifying user ${participantIdStr} about new group chat ${chatId}`)
          io.to(participantIdStr).emit("newChatAdded", chatData)
        }
      })
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      const disconnectedUserId = socketUsers.get(socket.id)
      debugLog(`Socket ${socket.id} disconnected, user: ${disconnectedUserId}`)

      if (disconnectedUserId) {
        userSockets.delete(disconnectedUserId)
        socketUsers.delete(socket.id)

        // Update online users list
        const onlineUsers = Array.from(userSockets.keys())
        io.emit("onlineUsers", onlineUsers)
      }
    })
  })

  // Return the io instance so it can be used elsewhere
  return io
}

module.exports = setupSocket