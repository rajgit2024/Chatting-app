const express = require('express');
const { createOrGetPrivateChat, getUserChats,createGroupChat } = require('../controllers/chatController');
const { jwtAuthMiddleware,groupAdminOnly} = require('../middleware/jwtAuth');

const router = express.Router();

router.post('/group', jwtAuthMiddleware,groupAdminOnly,createGroupChat);
router.post('/private', jwtAuthMiddleware ,createOrGetPrivateChat);
router.get('/',jwtAuthMiddleware, getUserChats);


module.exports = router;