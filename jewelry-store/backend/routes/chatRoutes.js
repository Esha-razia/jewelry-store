const express = require('express');
const router = express.Router();
const { handleChatMessage, getRecommendations } = require('../controllers/chatController.js');

router.post('/', handleChatMessage);
router.get('/recommendations', getRecommendations);

module.exports = router;
