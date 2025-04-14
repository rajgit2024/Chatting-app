const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesByChat  } = require('../controllers/messagesController');


router.post('/send',jwtAuthMiddleware,sendMessage);
router.get('/:chat_id/:id',jwtAuthMiddleware,getMessagesByChat);

module.exports = router;