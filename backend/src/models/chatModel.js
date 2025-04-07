const pool = require('../db/pool');

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

const createPrivateChat = async (createdBy) => {
  const result = await pool.query(
    `INSERT INTO chats (is_group, created_by) VALUES (false, $1) RETURNING *`,
    [createdBy]
  );
  return result.rows[0];
};

const addChatMember = async (chat_id, user_id, role = 'member') => {
  await pool.query(
    `INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3)`,
    [chat_id, user_id, role]
  );
};

module.exports = {
  findPrivateChat,
  createPrivateChat,
  addChatMember,
  createChat
};
