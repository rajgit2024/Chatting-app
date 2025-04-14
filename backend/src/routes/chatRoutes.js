const express = require('express');
const { createPrivateChat, getUserChatList,createGroupChat } = require('../controllers/chatController');
const { jwtAuthMiddleware,groupAdminOnly} = require('../middleware/jwtAuth');

const router = express.Router();

router.post('/group', jwtAuthMiddleware,groupAdminOnly,createGroupChat);
router.post('/private', jwtAuthMiddleware ,createPrivateChat);
router.get('/',jwtAuthMiddleware, getUserChatList);


module.exports = router;