const express = require('express');
const router = express.Router();
const medicalHistoryController = require('../app/controllers/medicalHistoryController');

router.post('/create', medicalHistoryController.createMedicalHistory);
router.get('/getByPatientId/:id', medicalHistoryController.getMedicalHistoryByPatientId);

module.exports = router;

