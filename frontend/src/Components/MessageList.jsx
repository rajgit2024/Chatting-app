"use client"

import { useEffect, useRef } from "react"
import { format } from "date-fns"
import { useAuth } from "../contexts/AuthContext"

const MessageList = ({ messages }) => {
  const { user } = useAuth()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatMessageTime = (dateString) => {
    return format(new Date(dateString), "HH:mm")
  }

  // Group messages by sender and time proximity
  const groupedMessages = messages.reduce((groups, message, index) => {
    const prevMessage = messages[index - 1]

    if (
      !prevMessage ||
      prevMessage.sender_id !== message.sender_id ||
      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000
    ) {
      groups.push([message])
    } else {
      groups[groups.length - 1].push(message)
    }

    return groups
  }, [])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full justify-center items-center text-gray-500 dark:text-gray-400">
        <div className="text-center p-4">
          <p className="mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {groupedMessages.map((group, groupIndex) => {
        const isCurrentUser = group[0].sender_id === user?.id

        // Get sender info from message.sender or use fallbacks
        const sender = group[0].sender || {}
        const senderUsername = sender.username || (isCurrentUser ? "You" : "User")
        const senderProfilePic = sender.profile_pic

        return (
          <div key={groupIndex} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%]`}>
              {!isCurrentUser && (
                <div className="h-8 w-8 mt-1 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 text-center text-sm font-bold text-white flex items-center justify-center">
                  {senderProfilePic ? (
                    <img
                      src={senderProfilePic || "/placeholder.svg?height=32&width=32"}
                      alt={senderUsername}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    senderUsername.charAt(0).toUpperCase()
                  )}
                </div>
              )}

              <div className={`flex flex-col ${isCurrentUser ? "items-end mr-2" : "items-start ml-2"}`}>
                {!isCurrentUser && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{senderUsername}</span>
                )}

                <div className="space-y-1">
                  {group.map((message, messageIndex) => (
                    <div key={message.id} className="flex items-end">
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                        } ${message.pending ? "opacity-70" : ""} ${message.failed ? "bg-red-300 dark:bg-red-800" : ""}`}
                      >
                        {message.content}
                        {message.pending && <span className="ml-2 text-xs opacity-70">Sending...</span>}
                        {message.failed && <span className="ml-2 text-xs text-red-500">Failed</span>}
                      </div>

                      {messageIndex === group.length - 1 && (
                        <span className={`text-xs text-gray-500 dark:text-gray-400 ${isCurrentUser ? "mr-2" : "ml-2"}`}>
                          {formatMessageTime(message.created_at)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
