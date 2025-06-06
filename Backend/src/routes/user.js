const express = require('express')
const router = express.Router();
const userController = require('../app/controllers/userController')

router.get('/get', userController.getAllUsers);
router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
router.post('/verify-otp', userController.verifyUser);

module.exports = router;