const express = require('express');
const router = express.Router();
const staffController = require('../app/controllers/staffController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', staffController.createStaff);
router.post('/import', upload.single('file'), staffController.importExcel);
router.get('/', staffController.listStaff);
router.put('/lock/:id', staffController.lockUser);
router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);

module.exports = router;