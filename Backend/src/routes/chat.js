const express = require("express");
const router = express.Router();
const ChatController = require("../app/controllers/chatController");

router.post("/ask", ChatController.askGemini);

module.exports = router;
