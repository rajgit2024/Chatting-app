"use client"
import { useChat } from "../contexts/ChatContext"

const TypingIndicator = () => {
  const { getTypingUsers } = useChat()
  const typingUsers = getTypingUsers()

  if (typingUsers.length === 0) {
    return null
  }

  return (
    <div className="flex items-center text-gray-500 text-sm italic p-2">
      <div className="typing-animation mr-2">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      {typingUsers.length === 1 ? (
        <span>{typingUsers[0]?.username || "Someone"} is typing...</span>
      ) : (
        <span>Multiple people are typing...</span>
      )}
      <style jsx>{`
        .typing-animation {
          display: inline-flex;
          align-items: center;
        }
        .dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: currentColor;
          margin: 0 1px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default TypingIndicator
