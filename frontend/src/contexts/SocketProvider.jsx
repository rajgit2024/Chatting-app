"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  // Debug logging
  const debugLog = useCallback((message, data = null) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    console.log(`[${timestamp}] [Socket] ${message}`, data || "")
  }, [])

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      debugLog("Not authenticated, not connecting socket")
      if (socket) {
        debugLog("Disconnecting existing socket")
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
      return
    }

    debugLog("Initializing socket connection...")
    const socketInstance = io("http://localhost:5000", {
      auth: {
        token,
        user: user, // Send the entire user object for identification
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on("connect", () => {
      debugLog("Socket connected with ID:", socketInstance.id)
      setConnected(true)

      // Explicitly identify this user to the server
      socketInstance.emit("identify", { userId: user.id })
    })

    socketInstance.on("disconnect", (reason) => {
      debugLog("Socket disconnected:", reason)
      setConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      debugLog("Socket connection error:", error.message)
      setConnected(false)
    })

    socketInstance.on("error", (error) => {
      debugLog("Socket error:", error)
    })

    // Listen for online users
    socketInstance.on("activeUsers", (users) => {
      debugLog("Received active users:", users)
      setOnlineUsers(users)
    })

    socketInstance.on("userOnline", (userId) => {
      debugLog(`User ${userId} is online`)
      setOnlineUsers((prev) => {
        if (prev.includes(userId)) return prev
        return [...prev, userId]
      })
    })

    socketInstance.on("userOffline", (userId) => {
      debugLog(`User ${userId} is offline`)
      setOnlineUsers((prev) => prev.filter((id) => id !== userId))
    })

    // Listen for debug messages from server
    socketInstance.on("debug", (message) => {
      debugLog("Server debug:", message)
    })

    setSocket(socketInstance)

    return () => {
      debugLog("Cleaning up socket connection")
      socketInstance.disconnect()
    }
  }, [isAuthenticated, user, token, debugLog])

  // Expose a function to manually join rooms
  const joinRoom = useCallback(
    (roomId) => {
      if (socket && connected) {
        debugLog(`Manually joining room: ${roomId}`)
        socket.emit("joinRoom", roomId)
        return true
      }
      debugLog(`Failed to join room ${roomId}: Socket not connected`)
      return false
    },
    [socket, connected, debugLog],
  )

  // Provide the context value
  const value = {
    socket,
    connected,
    joinRoom,
    onlineUsers,
    isUserOnline: useCallback((userId) => onlineUsers.includes(userId?.toString()), [onlineUsers]),
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
