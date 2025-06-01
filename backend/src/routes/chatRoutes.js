const express = require('express');
const { createOrGetPrivateChat, getUserChatList,createGroupChat,removeUsersFromGroup,addUsersToGroup } = require('../controllers/chatController');
const { jwtAuthMiddleware,groupAdminOnly} = require('../middleware/jwtAuth');

const router = express.Router();

router.post('/group', jwtAuthMiddleware,createGroupChat);
router.post('/private', jwtAuthMiddleware ,createOrGetPrivateChat);
router.get('/get',jwtAuthMiddleware, getUserChatList);
router.post('/group/:chat_id/remove', jwtAuthMiddleware,groupAdminOnly, removeUsersFromGroup);
router.post('/group/:chat_id/add', jwtAuthMiddleware,groupAdminOnly, addUsersToGroup);

module.exports = router;