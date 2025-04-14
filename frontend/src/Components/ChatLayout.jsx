import React from 'react';
import { Outlet } from 'react-router-dom';
import ChatSidebar from './ChatSideBar';

function ChatLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet /> {/* This is where the nested routes will render */}
      </main>
    </div>
  );
}

export default ChatLayout;