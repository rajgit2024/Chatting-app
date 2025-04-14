import React, { useState, useEffect } from "react"
import ChatLayout from "./ChatLayout"
import ChatHeader from "./ChatHeader"
import ChatMessages from "./ChatMessages"
import MessageInput from "./MessageInput"

const getMockChatData = (id) => {
  return {
    id: Number.parseInt(id),
    name: id === "1" ? "Team Project Discussion" : id === "2" ? "Sarah Johnson" : `Chat ${id}`,
    isGroup: id === "1",
    members: [
      { id: 1, name: "You", isAdmin: true, profilePic: "/placeholder.svg?height=40&width=40" },
      { id: 2, name: "Sarah Johnson", profilePic: "/placeholder.svg?height=40&width=40" },
      ...(id === "1"
        ? [
            { id: 3, name: "Mike Peters", profilePic: "/placeholder.svg?height=40&width=40" },
            { id: 4, name: "Emma Wilson", profilePic: "/placeholder.svg?height=40&width=40" },
          ]
        : []),
    ],
    messages: [
      {
        id: 1,
        senderId: 2,
        content: "Hey there! How's the project coming along?",
        createdAt: new Date(Date.now() - 3600000 * 24),
        isRead: true,
      },
      {
        id: 2,
        senderId: 1,
        content: "It's going well! I've finished the database schema and started working on the UI.",
        createdAt: new Date(Date.now() - 3600000 * 23),
        isRead: true,
      },
      {
        id: 3,
        senderId: 2,
        content: "That sounds great! Can you share your progress so far?",
        createdAt: new Date(Date.now() - 3600000 * 22),
        isRead: true,
      },
      {
        id: 4,
        senderId: 1,
        content: "Sure, I'll send you the mockups later today.",
        createdAt: new Date(Date.now() - 3600000 * 21),
        isRead: true,
      },
      {
        id: 5,
        senderId: 2,
        content: "Perfect, looking forward to seeing them!",
        createdAt: new Date(Date.now() - 3600000 * 20),
        isRead: true,
      },
      ...(id === "1"
        ? [
            {
              id: 6,
              senderId: 3,
              content: "I've been working on the API endpoints. Should be done by tomorrow.",
              createdAt: new Date(Date.now() - 3600000 * 5),
              isRead: true,
            },
            {
              id: 7,
              senderId: 4,
              content: "Great progress everyone! I'll schedule a team meeting for next week.",
              createdAt: new Date(Date.now() - 3600000 * 2),
              isRead: true,
            },
          ]
        : []),
    ],
  }
}

export default function ChatPage({ chatId = "1" }) {
  const [chatData, setChatData] = useState(null)

  useEffect(() => {
    const data = getMockChatData(chatId)
    setChatData(data)
  }, [chatId])

  if (!chatData) return <div>Loading chat...</div>

  return (
    <ChatLayout>
      <div className="flex flex-col h-full">
        <ChatHeader chat={chatData} />
        <ChatMessages messages={chatData.messages} members={chatData.members} />
        <MessageInput chatId={chatData.id} />
      </div>
    </ChatLayout>
  )
}
