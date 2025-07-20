const express = require('express');
const router = express.Router();
const notificationController = require('../app/controllers/notificationController');

router.post('/', notificationController.createNotification);
router.get('/:userId', notificationController.getUserNotifications);

module.exports = router;