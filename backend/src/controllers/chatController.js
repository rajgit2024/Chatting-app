const { findPrivateChat, createChat,createPrivateChat, addChatMember,  getChatById,
  getChatMembers,
  getChatsByUserId,
  getUserById,
 updateGroupChat,
  isUserInGroup,
  addUserToGroup,
  removeUserFromGroup, } = require("../models/chatModel");

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

// Create or get a private chat between two users
const createOrGetPrivateChat = async (req, res) => {
  const userId1 = req.user.id
  const { userId2 } = req.body

  try {
    // Validate input
    if (!userId2) {
      return res.status(400).json({ error: "Second user ID is required" })
    }

    // Check if users are the same
    if (userId1 === userId2) {
      return res.status(400).json({ error: "Cannot create chat with yourself" })
    }

    // Check if user2 exists
    const user2 = await getUserById(userId2)
    if (!user2) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if a private chat already exists
    const existingChat = await findPrivateChat(userId1, userId2)

    if (existingChat) {
      // Get chat members with user details
      const participants = await getChatMembers(existingChat.id)
      existingChat.participants = participants

      return res.status(200).json(existingChat)
    }

    // Create a new private chat
    const newChat = await createPrivateChat(userId1)

    // Add both users as members
    await addChatMember(newChat.id, userId1)
    await addChatMember(newChat.id, userId2)

    // Get the complete chat with members
    const completeChat = await getChatById(newChat.id)
    const participants = await getChatMembers(newChat.id)
    completeChat.participants = participants

    // Get the last message if any
    const lastMessage = await getLastMessage(completeChat.id)
    if (lastMessage) {
      completeChat.last_message = lastMessage
    }

    return res.status(201).json(completeChat)
  } catch (error) {
    console.error("Error handling private chat:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// Add this helper function to get the last message
const getLastMessage = async (chatId) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
              json_build_object(
                'id', u.id, 
                'username', u.username, 
                'profile_pic', u.profile_pic
              ) as sender
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.created_at DESC
       LIMIT 1`,
      [chatId],
    )

    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting last message:", error)
    return null
  }
}



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

const updateGroupChatDetails = async (req, res) => {
  const { chat_id } = req.params;
  const { name, group_pic } = req.body;
  const user_id = req.user.id;

  try {
    const chat = await getChatById(chat_id);
    if (!chat || !chat.is_group) return res.status(404).json({ message: "Group chat not found" });

    if (chat.admin_id !== user_id)
      return res.status(403).json({ message: "Only admin can update group chat" });

    const updatedChat = await updateGroupChat(chat_id, name, group_pic);
    res.status(200).json({ message: "Group updated", chat: updatedChat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Help admin to add user in the group
const addUsersToGroup = async (req, res) => {
  const { chat_id } = req.params;
  const { user_id_to_add } = req.body;

  try {
    const chat = await getChatById(chat_id);
    if (!chat || !chat.is_group) return res.status(404).json({ message: "Group not found" });

    const exists = await isUserInGroup(chat_id, user_id_to_add);
    if (exists) return res.status(400).json({ message: "User already in group" });

    await addUserToGroup(chat_id, user_id_to_add);
    res.status(200).json({ message: "User added to group" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Help admin to remove user from the group
const removeUsersFromGroup = async (req, res) => {
  const { chat_id } = req.params;
  const { user_id_to_remove } = req.body;
  const user_id = req.user.id;

  try {
    const chat = await getChatById(chat_id);
    if (!chat || !chat.is_group) return res.status(404).json({ message: "Group not found" });

    // if (chat.admin_id !== user_id)
    //   return res.status(403).json({ message: "Only admin can remove users" });

    const removed = await removeUserFromGroup(chat_id, user_id_to_remove);
    if (!removed) return res.status(400).json({ message: "User not in group" });

    res.status(200).json({ message: "User removed from group" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
   createOrGetPrivateChat,
   getUserChatList,
  createGroupChat,
    updateGroupChatDetails,
  addUsersToGroup,
  removeUsersFromGroup,
 };
