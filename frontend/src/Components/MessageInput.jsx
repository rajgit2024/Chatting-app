import React, { useState, useRef } from "react"
import { Paperclip, Send, Smile } from "lucide-react"

export function MessageInput({ chatId }) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message to chat", chatId, ":", message)
      setMessage("")

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleTextareaChange = (e) => {
    setMessage(e.target.value)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="border-t p-3 bg-white">
      <div className="flex items-end gap-2">
        {/* Attachment Icon */}
        <button
          type="button"
          className="rounded-full flex-shrink-0 p-2 text-gray-600 hover:text-blue-500 hover:bg-gray-100"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Textarea with emoji button */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full resize-none overflow-hidden pr-10 max-h-32 border rounded-md border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            className="absolute right-2 bottom-1 p-1 rounded-full h-8 w-8 text-gray-600 hover:text-blue-500"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="rounded-full flex-shrink-0 p-2 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
