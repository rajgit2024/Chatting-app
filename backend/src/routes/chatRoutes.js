const express = require('express');
const { createPrivateChat, getUserChatList } = require('../controllers/chatController');

const router = express.Router();

router.post('/private', createPrivateChat);
router.get('/:user_id', getUserChatList);

module.exports = router;