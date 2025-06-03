const express = require('express');
const router = express.Router();
const staffController = require('../app/controllers/staffController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', staffController.createStaff);
router.post('/import', upload.single('file'), staffController.importExcel);
router.get('/', staffController.listStaff);
router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.put('/lock/:id', staffController.lockUser);

module.exports = router;