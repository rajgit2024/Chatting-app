const { findPrivateChat, createChat,createPrivateChat, addChatMember,getChatsByUserId } = require("../models/chatModel");

const createGroupChat = async (req, res) => {
  try {
    console.log("Body received:", req.body);
    console.log("User:", req.user);

    const { name, isGroup, members } = req.body;
    const createdBy = req.user.id;

    if (!name || !Array.isArray(members)) {
      return res.status(400).json({ error: "Name and members are required." });
    }

    const chat = await createChat(name, isGroup, createdBy);
    console.log("Chat created:", chat);

    await addChatMember(chat.id, createdBy, 'admin');

    for (const memberId of members) {
      if (memberId !== createdBy) {
        await addChatMember(chat.id, memberId);
      }
    }
    const fullChat = await getChatsByUserId(chat.id);

    res.status(201).json(fullChat); // 👈 return full chat object
  } catch (error) {
    console.error('Error in createGroupChat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller: Create or Get Private Chat
const createOrGetPrivateChat = async (req, res) => {
  const userId1 = req.user.id; // Authenticated user
  const { userId2 } = req.body; // The user to chat with

  try {
    const existingChat = await findPrivateChat(userId1, userId2);

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = await createPrivateChat(userId1);

    // Insert both users into chat_members
    await addChatMember(newChat.id, userId1); // sender
    await addChatMember(newChat.id, userId2); // receiver
    return res.status(201).json(newChat);
  } catch (error) {
    console.error('Error handling private chat:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Get all chats for logged-in user
const getUserChatList = async (req, res) => {
  try {
    const chats = await getChatsByUserId(req.user.id);
    return res.json(chats);
  } catch (err) {
    console.error("Error fetching chats", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createOrGetPrivateChat, getUserChatList,createGroupChat };
