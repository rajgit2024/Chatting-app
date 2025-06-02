"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user) {
      console.log("Socket: User not authenticated, skipping connection")
      return
    }

    console.log("Socket: Attempting to connect...")

    // Create socket connection with error handling
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      query: {
        userId: user.id,
      },
      auth: {
        user: user,
      },
    })

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("Socket: Connected successfully")
      setConnected(true)

      // Identify user to server
      newSocket.emit("identify", { userId: user.id })
    })

    newSocket.on("disconnect", (reason) => {
      console.log("Socket: Disconnected:", reason)
      setConnected(false)
    })

    newSocket.on("connect_error", (error) => {
      console.log("Socket: Connection error:", error.message)
      setConnected(false)
    })

    newSocket.on("error", (error) => {
      console.log("Socket: Error:", error)
    })

    setSocket(newSocket)

    // Cleanup on unmount or user change
    return () => {
      console.log("Socket: Cleaning up connection")
      newSocket.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [isAuthenticated, user])

  const value = {
    socket,
    connected,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
