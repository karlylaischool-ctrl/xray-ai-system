const express = require('express');
const router = express.Router();
const { askChatbot } = require('../controllers/chatbotController');
const { protect, authorize } = require('../middleware/auth');

router.post('/ask', protect, authorize('patient'), askChatbot);

module.exports = router;
