import { useEffect, useRef } from "react"

export function ChatMessages({ messages, members }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatMessageDate = (date) => {
    const msgDate = new Date(date)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (msgDate.toDateString() === today.toDateString()) return "Today"
    if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday"

    return msgDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
  }

  const groupedMessages = {}
  messages.forEach((msg) => {
    const key = new Date(msg.createdAt).toDateString()
    if (!groupedMessages[key]) groupedMessages[key] = []
    groupedMessages[key].push(msg)
  })

  const getMemberById = (id) => {
    return members.find((m) => m.id === id) || { name: "Unknown", profilePic: "" }
  }

  const isCurrentUser = (senderId) => senderId === 1 // Change logic accordingly

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
        <div key={dateKey} className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatMessageDate(dateKey)}
            </div>
          </div>

          {msgs.map((msg, i) => {
            const sender = getMemberById(msg.senderId)
            const isMine = isCurrentUser(msg.senderId)
            const showAvatar =
              !isMine && (i === 0 || msgs[i - 1].senderId !== msg.senderId)

            return (
              <div
                key={msg.id}
                className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
              >
                {!isMine && (
                  <div className="w-8 mr-2 flex-shrink-0">
                    {showAvatar ? (
                      <img
                        src={sender.profilePic || "/placeholder.svg"}
                        alt={sender.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>
                )}

                <div className={`max-w-[70%] ${isMine ? "order-1" : "order-2"}`}>
                  {!isMine && showAvatar && (
                    <p className="text-xs text-gray-500 mb-1">{sender.name}</p>
                  )}

                  <div
                    className={`rounded-lg px-3 py-2 inline-block ${
                      isMine
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>

                  <p className={`text-xs mt-1 ${isMine ? "text-right" : ""} text-gray-500`}>
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  )
}
