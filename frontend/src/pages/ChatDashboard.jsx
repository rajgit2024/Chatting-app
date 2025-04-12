import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { Button } from '@/components/ui/button';
import ChatListItem from '../components/ChatListItem';

const ChatDashboard = () => {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      const res = await axios.get('/chats'); // Assumes token is sent in axios instance
      setChats(res.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleNewPrivateChat = () => {
    const userId = prompt('Enter the user ID to start a private chat:');
    if (userId) {
      axios.post('/chats/private', { userId2: userId }).then((res) => {
        navigate(`/chat/${res.data.id}`);
      });
    }
  };

  const handleCreateGroup = () => {
    navigate('/create-group');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r overflow-y-auto bg-gray-100">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <div className="flex gap-2">
            <Button onClick={handleNewPrivateChat} variant="outline">New Chat</Button>
            <Button onClick={handleCreateGroup}>+ Group</Button>
          </div>
        </div>

        {chats.length === 0 ? (
          <p>No chats found</p>
        ) : (
          chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} onClick={() => navigate(`/chat/${chat.id}`)} />
          ))
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">Select a chat to start messaging</p>
      </div>
    </div>
  );
};

export default ChatDashboard;
