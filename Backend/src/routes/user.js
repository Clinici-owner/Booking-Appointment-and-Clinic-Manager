const express = require('express')
const router = express.Router();
const userController = require('../app/controllers/userController')

router.get('/get', userController.getAllUsers);
router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
router.post('/verify-otp', userController.verifyUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-forgot-password', userController.verifyForgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/logout', userController.logoutUser);
router.get('/session', userController.getSessionUser);
router.get('/profile', userController.getUserProfileByUserID);
router.put('/updateprofile', userController.updateUserProfile);

module.exports = router;