const express = require('express')
const router = express.Router();
const userController = require('../app/controllers/userController')

router.get('/get', userController.getAllUsers);

module.exports = router;