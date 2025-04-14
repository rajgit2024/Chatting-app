import React, { useState , useEffect} from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  Settings,
  LogOut,
  User,
  Users,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";

const mockChats = [
  { id: 1, name: "Team Project Discussion", isGroup: true, lastMessage: "Emma: Great progress everyone!", unreadCount: 2, updatedAt: new Date(Date.now() - 3600000 * 2) },
  { id: 2, name: "Sarah Johnson", isGroup: false, lastMessage: "Perfect, looking forward to seeing them!", unreadCount: 0, updatedAt: new Date(Date.now() - 3600000 * 20) },
  { id: 3, name: "Marketing Team", isGroup: true, lastMessage: "John: When is our next meeting?", unreadCount: 5, updatedAt: new Date(Date.now() - 3600000 * 5) },
  { id: 4, name: "David Wilson", isGroup: false, lastMessage: "Can we discuss the proposal tomorrow?", unreadCount: 0, updatedAt: new Date(Date.now() - 3600000 * 25) },
  { id: 5, name: "Product Development", isGroup: true, lastMessage: "Alex: I've pushed the latest changes", unreadCount: 0, updatedAt: new Date(Date.now() - 3600000 * 48) },
  { id: 6, name: "Lisa Taylor", isGroup: false, lastMessage: "Thanks for your help!", unreadCount: 0, updatedAt: new Date(Date.now() - 3600000 * 72) },
  { id: 7, name: "Client Meeting Notes", isGroup: true, lastMessage: "Maria: I've shared the meeting notes", unreadCount: 0, updatedAt: new Date(Date.now() - 3600000 * 96) },
  { id: 8, name: "Robert Brown", isGroup: false, lastMessage: "Let's catch up next week", unreadCount: 0, updatedAt: new Date(Date.now() - 3600000 * 120) },
];

const ChatSidebar = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className={`h-full ${sidebarOpen ? 'block' : 'hidden'} md:block w-80 border-r bg-white`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl text-chat-dark font-bold">Palsio</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-chat-gray-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-chat-gray-500" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full text-sm pl-8 pr-2 py-2 border border-chat-gray-300 rounded-md focus:border-chat-primary focus:ring-chat-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-2 border-b border-chat-gray-200">
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center border border-chat-gray-300 text-sm font-medium text-chat-gray-700 rounded-md py-2 hover:bg-chat-light hover:text-chat-primary">
            <MessageSquare className="mr-2 h-4 w-4" />
            New Chat
          </button>
          <button className="flex-1 flex items-center justify-center border border-chat-gray-300 text-sm font-medium text-chat-gray-700 rounded-md py-2 hover:bg-chat-light hover:text-chat-primary">
            <Users className="mr-2 h-4 w-4" />
            New Group
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="p-2">
          {filteredChats.map((chat) => (
            <Link to={`/chats/${chat.id}`} key={chat.id}>
              <div
                className={`flex items-center p-3 rounded-lg mb-1 hover:bg-chat-light ${location.pathname === `/chats/${chat.id}` ? "bg-chat-light border-l-4 border-chat-primary" : ""}`}
              >
                <div className="h-10 w-10 mr-3 rounded-full bg-gray-300 flex items-center justify-center">
                  {chat.isGroup ? <Users className="h-5 w-5" /> : chat.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatDate(chat.updatedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="ml-2 bg-chat-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-chat-primary text-white flex items-center justify-center mr-2">JD</div>
                <div>
                  <p className="font-medium text-sm">John Doe</p>
                  <p className="text-xs text-gray-500">john.doe@example.com</p>
                </div>
              </div>
              <div className="relative">
                <button className="p-2 hover:text-chat-primary">
                  <Settings className="h-5 w-5" />
                </button>
                {/* You can build dropdown here */}
              </div>
            </div>
          </div>
          
    </div>
  );
};

export default ChatSidebar;
