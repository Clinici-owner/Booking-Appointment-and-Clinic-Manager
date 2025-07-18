const express = require('express');
const router = express.Router();
const medicalHistoryController = require('../app/controllers/medicalHistoryController');

router.get('/getAll', medicalHistoryController.getAllMedicalHistories);
router.post('/create', medicalHistoryController.createMedicalHistory);
router.get('/getByPatientId/:id', medicalHistoryController.getMedicalHistoryByPatientId);
router.get('/getByStepId/:stepId', medicalHistoryController.getMedicalHistoryByStepId);

module.exports = router;

