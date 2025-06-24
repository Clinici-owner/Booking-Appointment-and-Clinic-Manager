const express = require('express');
const router = express.Router();
const doctorController = require('../app/controllers/doctorController');

router.post('/create', doctorController.createDoctorProfile);
router.get('/:id', doctorController.getDoctorProfileByDoctorId);
router.post('/:id', doctorController.updateDoctorProfile);

module.exports = router;