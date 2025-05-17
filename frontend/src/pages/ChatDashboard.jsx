import { useState, useEffect, useRef } from "react"
import { useChat } from "../contexts/ChatContext"
import { useAuth } from "../contexts/AuthContext"
import { useSocket } from "../contexts/SocketProvider"
import { Users, Menu, PlusCircle, AlertCircle } from "lucide-react"
import CreateGroupChat from "../components/CreateGroupChat"
import ChatList from "../components/ChatListItem"
import MessageList from "../components/MessageList"
import MessageInput from "../components/MessageInput"
import TypingIndicator from "../components/TypingIndicator"

const ChatDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const { currentChat, messages, fetchChats, loading, getOtherUser } = useChat()
  const { connected } = useSocket()

  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [error, setError] = useState(null)
  const messagesContainerRef = useRef(null)

  // Debug authentication status
  useEffect(() => {
    console.log("ChatDashboard - Auth status:", { isAuthenticated, userId: user?.id })
  }, [isAuthenticated, user])

  useEffect(() => {
    // Only fetch chats if authenticated
    if (isAuthenticated) {
      console.log("User is authenticated, fetching chats")
      fetchChats().catch((err) => {
        console.error("Error fetching chats:", err)
        setError("Failed to load chats. Please try refreshing the page.")
      })
    } else {
      console.log("User is not authenticated, skipping fetchChats")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Show authentication warning if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be logged in to access the chat. Please log in and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Error message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-full p-2 border dark:border-gray-700 dark:bg-gray-800"
        >
          <Menu className="h-5 w-5 dark:text-gray-200" />
        </button>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-10">
          <div className="w-80 h-full bg-white dark:bg-gray-950 fixed left-0 top-0">
            <ChatList onClose={handleCloseMobileMenu} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block md:w-80 h-full border-r dark:border-gray-800">
        <ChatList />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center">
                {currentChat.is_group ? (
                  <div className="relative">
                    <div className="h-10 w-10 bg-green-500 rounded-full text-white flex items-center justify-center">
                      {currentChat.name?.charAt(0) || "G"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-gray-200 dark:bg-gray-900 p-1 rounded-full">
                      <Users className="h-3 w-3" />
                    </div>
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-gray-300 rounded-full overflow-hidden">
                    {currentChat.members || currentChat.participants ? (
                      <img
                        src={getOtherUser(currentChat)?.profile_pic || "/placeholder.svg?height=40&width=40"}
                        alt={getOtherUser(currentChat)?.username || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                )}
                <div className="ml-3">
                  <h2 className="text-lg font-semibold dark:text-white">
                    {currentChat.is_group ? currentChat.name : getOtherUser(currentChat)?.username || "Chat"}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className={`h-2 w-2 rounded-full mr-2 ${connected ? "bg-green-500" : "bg-red-500"}`}></span>
                    {connected ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto dark:bg-gray-900" ref={messagesContainerRef}>
              <MessageList messages={messages} />
              <TypingIndicator />
            </div>

            {/* Message input */}
            <MessageInput />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 dark:text-white">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold mb-2">Welcome to Chat App</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select a chat from the sidebar or start a new conversation
              </p>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="bg-gray-200 dark:bg-gray-700 px-6 py-2 rounded flex items-center justify-center md:hidden"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Chats
                </button>
                <button
                  onClick={() => setShowNewGroupDialog(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded flex items-center justify-center"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Chat Modal */}
      <CreateGroupChat open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog} />
    </div>
  )
}

export default ChatDashboard
