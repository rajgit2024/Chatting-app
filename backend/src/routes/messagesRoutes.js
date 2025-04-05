const express = require('express');
const router = express.Router();

const { sendMessage, getMessagesByChat  } = require('../controllers/messagesController');
const { jwtAuthMiddleware } = require("../middleware/jwtAuth");

router.post('/send', sendMessage);
router.get('/:chat_id', getMessagesByChat);


module.exports = router;