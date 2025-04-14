import { MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"
import { ChatHeader } from "./ChatHeader"

const EmptyChatState = () => {
  return (
    <>
    <div>
    <ChatHeader />

    </div>
    <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gradient-to-br from-white to-gray-100">
      <div className="bg-gray-100 p-6 rounded-full mb-4 border-2 border-blue-300">
        <MessageSquare className="h-12 w-12 text-blue-400" />
      </div>

      <h2 className="text-2xl font-bold mb-2 text-gray-800">No chat selected</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        Select a chat from the sidebar or start a new conversation to begin messaging.
      </p>

      <div className="flex gap-4">
        {/* Outline Button */}
        <Link
          to="/chats/1"
          className="px-4 py-2 border rounded-md text-blue-500 border-blue-500 hover:bg-blue-50 transition"
        >
          View Demo Chat
        </Link>

        {/* Filled Button */}
        <Link
          to="/chats/2"
          className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Start New Chat
        </Link>
      </div>
    </div>
    </>
  )
}

export default EmptyChatState;
