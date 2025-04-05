const { findPrivateChat, createChat, addChatMembers, getUserChats } = require("../models/chatModel");

const createPrivateChat = async (req, res) => {
  try {
    // Extract users from request body
    const { user1, user2 } = req.body;
    
    if (!user1 || !user2) {
      return res.status(400).json({ error: "Both user1 and user2 are required" });
    }

    // Check if a private chat already exists
    let chat = await findPrivateChat(user1, user2);

    if (!chat) {
      // Create new private chat
      chat = await createChat('private', null, null, user1);
      
      // Add both users as members in chat_members
      await addChatMembers(chat.id, user1, 'member');
      await addChatMembers(chat.id, user2, 'member');
    }

    return res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating private chat:", error);
    return res.status(500).json({ error: error.message });
  }
};

//fetch the list of chats a user is a part of
const getUserChatList = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const chats = await getUserChats(user_id);
    return res.json(chats);
  } catch (error) {
    console.error("Error getting user chats:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { createPrivateChat, getUserChatList };
