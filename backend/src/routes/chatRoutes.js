const express = require('express');
const { createOrGetPrivateChat, getUserChatList,createGroupChat } = require('../controllers/chatController');
const { jwtAuthMiddleware,groupAdminOnly} = require('../middleware/jwtAuth');

const router = express.Router();

router.post('/group', jwtAuthMiddleware,createGroupChat);
router.post('/private', jwtAuthMiddleware ,createOrGetPrivateChat);
router.get('/get',jwtAuthMiddleware, getUserChatList);


module.exports = router;