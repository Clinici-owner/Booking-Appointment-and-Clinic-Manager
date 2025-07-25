const express = require("express");
const router = express.Router();
const ChatController = require("../app/controllers/chatController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/ask", ChatController.askGemini);
router.post("/cccd", upload.single("image"), ChatController.uploadCCCD);
module.exports = router;
