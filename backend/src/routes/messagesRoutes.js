const express = require('express');
const router = express.Router();
const{jwtAuthMiddleware}=require('../middleware/jwtAuth.js')
const { sendMessage, getMessagesByChat  } = require('../controllers/messagesController');


router.post('/send',jwtAuthMiddleware,sendMessage);
router.get('/:chat_id',jwtAuthMiddleware,getMessagesByChat);

module.exports = router;