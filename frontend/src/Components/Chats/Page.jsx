import React from "react"
import ChatLayout from "../ChatLayout"
import EmptyChatState from "../EmptyChatState"

export default function ChatsPage() {
  return (
    <ChatLayout>
      <EmptyChatState />
    </ChatLayout>
  )
}
