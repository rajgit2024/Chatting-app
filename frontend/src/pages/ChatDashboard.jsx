import { useState, useEffect, useRef } from "react";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketProvider";
import { Users, Send, Menu, PlusCircle } from "lucide-react";
import CreateGroupChat from "../components/CreateGroupChat";
import ChatListItem from "../components/ChatListItem"

const ChatDashboard = () => {
  const { user, logout } = useAuth();
  const { currentChat, messages,fetchChats, sendMessage, createGroupChat, loading,setChats,chats, setCurrentChat } = useChat();
  const { connected } = useSocket();

  const [messageInput, setMessageInput] = useState("");
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  useEffect(() => {
    fetchChats(); // load all chats when dashboard opens
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessage(messageInput);
    setMessageInput("");
  };

  const handleCreateGroup = async (groupName, selectedUsers) => {
    try {
      const newChat = await createGroupChat(groupName, selectedUsers);
      setChats((prev) => [newChat, ...prev]);
      setShowNewGroupDialog(false); // Close modal
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };  

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-full p-2 border"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-10">
          <div className="w-64 h-full bg-white fixed left-0 top-0">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2"
            >
              Close
            </button>
            <div>{/* Sidebar content */}</div>
          </div>
        </div>
      )}
     {/* Desktop sidebar */}
<div className="hidden md:flex md:w-80 h-full border-r flex-col p-4 overflow-y-auto">
  <h2 className="text-xl font-semibold mb-4">Chats</h2>
  {chats.length === 0 ? (
    <p className="text-gray-500">No chats yet.</p>
  ) : (
    Array.isArray(chats) && chats.map((chat) => (
      <ChatListItem
        key={chat.id}
        chat={chat}
        onClick={() => setCurrentChat(chat)}
      />
    ))
  )}
</div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                {currentChat.is_group ? (
                  <div className="relative">
                    <div className="h-10 w-10 bg-green-500 rounded-full text-white flex items-center justify-center">
                      {currentChat.name?.charAt(0) || "G"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                      <Users className="h-3 w-3" />
                    </div>
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-gray-300 rounded-full" />
                )}
                <div className="ml-3">
                  <h2 className="text-lg font-semibold">
                    {currentChat.is_group
                      ? currentChat.name
                      : currentChat.participants.find(
                          (p) => p.id !== user?.id
                        )?.username}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <span
                      className={`h-2 w-2 rounded-full mr-2 ${
                        connected ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {connected ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs p-3 rounded-lg shadow text-white text-sm ${
                      msg.sender_id === user?.id ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  >
                    <span>{msg.content}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded"
                  disabled={!connected}
                />
                <button
                  type="submit"
                  disabled={!connected || !messageInput.trim()}
                  className="bg-blue-500 text-white px-6 py-2 rounded"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold mb-2">Welcome to Chat App</h2>
              <p className="text-gray-600 mb-6">
                Select a chat from the sidebar or start a new conversation
              </p>
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="bg-gray-200 px-6 py-2 rounded"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Chats
                </button>
                <button
                  onClick={() => setShowNewGroupDialog(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded"
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
      {showNewGroupDialog && (
        <CreateGroupChat
        open={showNewGroupDialog}
        onOpenChange={setShowNewGroupDialog}
        onCreateGroup={handleCreateGroup}
      />      
      )}
    </div>
  );
};

export default ChatDashboard;