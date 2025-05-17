"use client"

import { useState, useEffect, useRef } from "react"
import { Send } from "lucide-react"
import { useChat } from "../contexts/ChatContext"

const MessageInput = () => {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { sendMessage, setTypingStatus, currentChat } = useChat()
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  // Handle typing indicator
  useEffect(() => {
    if (message.trim() && !typingTimeoutRef.current) {
      // Start typing
      setTypingStatus(true)

      // Set timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(false)
        typingTimeoutRef.current = null
      }, 2000)
    }

    // If message is empty, clear typing status
    if (!message.trim() && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
      setTypingStatus(false)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [message, setTypingStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || isSending || !currentChat) return

    try {
      setIsSending(true)
      const messageText = message.trim()
      setMessage("")
      await sendMessage(messageText)
      // Focus the input after sending
      inputRef.current?.focus()
    } catch (error) {
      console.error("Failed to send message:", error)
      // Restore the message if sending failed
      setMessage(message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-3 border-t dark:border-gray-700">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 mx-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        disabled={isSending || !currentChat}
      />
      <button
        type="submit"
        disabled={!message.trim() || isSending || !currentChat}
        className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Send size={20} />
        )}
      </button>
    </form>
  )
}

export default MessageInput
