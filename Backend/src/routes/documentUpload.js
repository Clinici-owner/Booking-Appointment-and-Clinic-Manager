const express = require('express');
const router = express.Router();
const documentUploadController = require('../app/controllers/documentUploadController');

router.post('/upload', documentUploadController.uploadDocument);


module.exports = router;