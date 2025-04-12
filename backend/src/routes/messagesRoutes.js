const express = require('express');
const router = express.Router();
const{jwtAuthMiddleware}=require('../middleware/jwtAuth.js')
const { sendMessage, getMessagesByChat  } = require('../controllers/messagesController');
const { jwtAuthMiddleware } = require("../middleware/jwtAuth");


router.post('/send',jwtAuthMiddleware,sendMessage);
router.get('/:chat_id/:id',jwtAuthMiddleware,getMessagesByChat);

module.exports = router;