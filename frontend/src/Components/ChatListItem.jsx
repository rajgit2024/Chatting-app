import React from "react";

const ChatListItem = ({ chat, onSelect, isActive }) => {
  const { name, is_group, lastMessage } = chat;

  return (
    <div
      onClick={() => onSelect(chat)}
      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors duration-200 shadow-sm ${
        isActive ? "bg-blue-100" : "hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
          {is_group ? name[0].toUpperCase() : "👤"}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{name}</h3>
          {lastMessage && (
            <p className="text-sm text-gray-500 truncate w-44">
              {lastMessage.content}
            </p>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-400">
        {/* Replace with a formatted time if available */}
        {lastMessage?.timestamp && new Date(lastMessage.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ChatListItem;
