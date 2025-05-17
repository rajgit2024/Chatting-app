import { useState } from "react"
import { Search, PlusCircle, X, MessageSquarePlus, Users } from "lucide-react"
import { useChat } from "../contexts/ChatContext"
import { useAuth } from "../contexts/AuthContext"
import { format } from "date-fns"
import CreateGroupChat from "./CreateGroupChat"
import NewPrivateChat from "./NewPrivateChat"

const ChatList = ({ onClose }) => {
  const { user, logout } = useAuth()
  const { chats, currentChat, setCurrentChat, loading, getUnreadCount, getOtherUser } = useChat()
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false)
  const [showNewPrivateChatDialog, setShowNewPrivateChatDialog] = useState(false)

  const filteredChats = chats.filter((chat) => {
    if (!chat) return false

    if (chat.is_group) {
      return chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    } else {
      // Get the other user in the chat
      const otherUser = getOtherUser(chat)
      if (!otherUser) return false

      return otherUser.username?.toLowerCase().includes(searchTerm.toLowerCase())
    }
  })

  const handleChatSelect = (chat) => {
    setCurrentChat(chat)
    if (onClose) onClose()
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()

    if (date.toDateString() === now.toDateString()) {
      return format(date, "HH:mm")
    } else if (date.getFullYear() === now.getFullYear()) {
      return format(date, "dd MMM")
    } else {
      return format(date, "dd/MM/yy")
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Chats</h1>
          {onClose && (
            <button onClick={onClose} className="ml-2 md:hidden p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowNewPrivateChatDialog(true)}
            className="p-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="New private chat"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowNewGroupDialog(true)}
            className="p-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="New group chat"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-8 pr-2 py-2 border rounded bg-transparent text-sm dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const isActive = currentChat?.id === chat.id
            const otherUser = getOtherUser(chat)
            const lastMessage = chat.last_message

            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`flex items-center p-3 rounded-lg cursor-pointer mb-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  isActive ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
              >
                {chat.is_group ? (
                  <div className="relative flex items-center justify-center h-10 w-10 bg-green-500 text-white rounded-full">
                    {chat.name?.charAt(0) || "G"}
                    <div className="absolute -bottom-1 -right-1 bg-gray-200 dark:bg-gray-900 p-1 rounded-full">
                      <Users className="h-3 w-3" />
                    </div>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                    <img
                      src={otherUser?.profile_pic || "/placeholder.svg?height=40&width=40"}
                      alt={otherUser?.username || "User"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">
                      {chat.is_group ? chat.name : otherUser?.username || "Unknown User"}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[80%]">
                      {lastMessage
                        ? `${lastMessage.sender_id === user?.id ? "You: " : ""}${lastMessage.content}`
                        : "No messages yet"}
                    </p>

                    {getUnreadCount && getUnreadCount(chat.id) > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getUnreadCount(chat.id)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
            {searchTerm ? "No chats found" : "No chats yet"}
          </div>
        )}
      </div>

      {/* User profile section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
              <img
                src={user?.profile_pic || "/placeholder.svg?height=40&width=40"}
                alt={user?.username}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded">
            Logout
          </button>
        </div>
      </div>

      {/* Group dialog modal */}
      <CreateGroupChat open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog} />

      {/* New private chat dialog */}
      <NewPrivateChat isOpen={showNewPrivateChatDialog} onClose={() => setShowNewPrivateChatDialog(false)} />
    </div>
  )
}

export default ChatList
