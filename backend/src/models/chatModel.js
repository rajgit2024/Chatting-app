const pool = require('../config/db');

const createChat = async (name, isGroup, createdBy) => {
  const result = await pool.query(
    `INSERT INTO chats (name, is_group, created_by) VALUES ($1, $2, $3) RETURNING *`,
    [name, isGroup, createdBy]
  );
  return result.rows[0];
};

const findPrivateChat = async (userId1, userId2) => {
  const result = await pool.query(
    `
    SELECT chats.*
    FROM chats
    JOIN chat_members cm1 ON chats.id = cm1.chat_id
    JOIN chat_members cm2 ON chats.id = cm2.chat_id
    WHERE chats.is_group = false
    AND cm1.user_id = $1 AND cm2.user_id = $2
    `,
    [userId1, userId2]
  );
  return result.rows[0];
};

const createPrivateChat = async (createdByUserId) => {
  const result = await pool.query(
    `INSERT INTO chats (is_group, created_by) VALUES ($1, $2) RETURNING *`,
    [false, createdByUserId] //  set isGroup to false explicitly
  );
  return result.rows[0];
};

const addChatMember = async (chat_id, user_id, role = 'member') => {
  await pool.query(
    `INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3)`,
    [chat_id, user_id, role]
  );
};

const isUserAdmin=async (chat_id,user_id)=>{
 
}

const getChatsByUserId = async (userId) => {
  const chatResult = await pool.query(`
    SELECT chats.* 
    FROM chats 
    INNER JOIN chat_members ON chats.id = chat_members.chat_id 
    WHERE chat_members.user_id = $1 
    ORDER BY chats.created_at DESC
  `, [userId]);

  const chats = chatResult.rows;

  // For each chat, fetch its members and include role
  for (const chat of chats) {
    const membersResult = await pool.query(`
      SELECT users.id, users.username, chat_members.role
      FROM users
      INNER JOIN chat_members ON users.id = chat_members.user_id
      WHERE chat_members.chat_id = $1
    `, [chat.id]);

    chat.members = membersResult.rows; // attach members with role
  }

  return chats;
};

const getChatMembers = async (chatId) => {
  const result = await pool.query(
    `
    SELECT u.id, u.username, u.email, u.profile_pic
    FROM users u
    JOIN chat_members cm ON u.id = cm.user_id
    WHERE cm.chat_id = $1
  `,
    [chatId],
  )

  return result.rows
}

// Get a chat by ID
const getChatById = async (chatId) => {
  const result = await pool.query(
    `
    SELECT * FROM chats WHERE id = $1
  `,
    [chatId],
  )

  return result.rows[0]
}

// Get user by ID
const getUserById = async (userId) => {
  const result = await pool.query(
    `
    SELECT id, username, email, profile_pic FROM users WHERE id = $1
  `,
    [userId],
  )

  return result.rows[0]
}

const updateGroupChat = async (chat_id, name, group_pic) => {
  const result = await pool.query(
    "UPDATE chats SET name = $1, group_pic = $2 WHERE id = $3 RETURNING *",
    [name, group_pic, chat_id]
  );
  return result.rows[0];
};

const isUserInGroup = async (chat_id, user_id) => {
  const result = await pool.query(
    "SELECT * FROM chat_members WHERE chat_id = $1 AND user_id = $2",
    [chat_id, user_id]
  );
  return result.rows.length > 0;
};

const addUserToGroup = async (chat_id, user_id) => {
  return await pool.query(
    "INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)",
    [chat_id, user_id]
  );
};

const removeUserFromGroup = async (chat_id, user_id) => {
  const result = await pool.query(
    "DELETE FROM chat_members WHERE chat_id = $1 AND user_id = $2 RETURNING *",
    [chat_id, user_id]
  );
  return result.rowCount > 0;
};

module.exports = {
  findPrivateChat,
  createPrivateChat,
  addChatMember,
  createChat,
  isUserAdmin,
  getChatById,
  getChatsByUserId,
  getChatMembers,
  getUserById,
   updateGroupChat,
  isUserInGroup,
  addUserToGroup,
  removeUserFromGroup,
};
