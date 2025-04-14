import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChatHeader } from './ChatHeader.jsx';
import { ChatMessages } from './ChatMessages.jsx';
import { MessageInput } from './MessageInput.jsx';

function ChatConversation() {
  const { id } = useParams(1); // Get the chat ID from the URL
  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch chat data based on the ID
    const fetchChatData = async () => {
      try {
        // In a real app, you would fetch from your API
        const response = await fetch(`/api/chats/${id}`);
        const data = await response.json();
        setChatData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!chatData) {
    return <div className="flex items-center justify-center h-full">Chat not found</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chat={chatData} />
      <ChatMessages messages={chatData.messages} members={chatData.members} />
      <MessageInput chatId={chatData.id} />
    </div>
  );
}

export default ChatConversation;