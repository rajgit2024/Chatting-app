const express = require('express');
const { createPrivateChat, getUserChatList } = require('../controllers/chatController');
const { jwtAuthMiddleware } = require('../middleware/jwtAuth');

const router = express.Router();

router.post('/private' ,createPrivateChat);
router.get('/mychats', getUserChatList);


module.exports = router;