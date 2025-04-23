import { format } from "date-fns"

const MessageList = ({ messages, currentUserId }) => {
  const formatMessageTime = (dateString) => {
    return format(new Date(dateString), "HH:mm")
  }

  // Group messages by sender and time gap
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

  return (
    <div className="space-y-6">
      {groupedMessages.map((group, groupIndex) => {
        const isCurrentUser = group[0].sender_id === currentUserId

        return (
          <div key={groupIndex} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%]`}>
              {/* Avatar - only for other users */}
              {!isCurrentUser && (
                <div className="h-8 w-8 mt-1 rounded-full overflow-hidden flex-shrink-0 bg-gray-300 text-center text-sm font-bold text-white flex items-center justify-center">
                  {group[0].sender?.profile_pic ? (
                    <img
                      src={group[0].sender.profile_pic}
                      alt={group[0].sender.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    group[0].sender?.username?.charAt(0).toUpperCase()
                  )}
                </div>
              )}

              <div className={`flex flex-col ${isCurrentUser ? "items-end mr-2" : "items-start ml-2"}`}>
                {/* Username - only show for others */}
                {!isCurrentUser && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {group[0].sender?.username}
                  </span>
                )}

                {/* Messages in group */}
                <div className="space-y-1">
                  {group.map((message, messageIndex) => (
                    <div key={message.id} className="flex items-end">
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                        }`}
                      >
                        {message.content}
                      </div>

                      {/* Timestamp */}
                      {messageIndex === group.length - 1 && (
                        <span
                          className={`text-xs text-gray-500 dark:text-gray-400 ${
                            isCurrentUser ? "mr-2" : "ml-2"
                          }`}
                        >
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

      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No messages yet. Start the conversation!
        </div>
      )}
    </div>
  )
}

export default MessageList
