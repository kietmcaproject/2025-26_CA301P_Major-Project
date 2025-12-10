const express = require('express');
const router = express.Router();
const geminiController = require('../controller/geminiController');
const { chatWithGemini } = require("../controller/geminiController");

router.post("/chat", chatWithGemini);

// Mount all Gemini controller routes directly
router.get('/learn/:problemId', geminiController.handleLearn);
router.get('/editorial/:problemId', geminiController.handleEditorial);
router.post('/learningpath/:topic/:level/:goal',geminiController.generateLearningPath);

module.exports = router;