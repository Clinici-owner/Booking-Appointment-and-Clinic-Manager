const express = require('express');
const router = express.Router();
const medicalProcessController = require('../app/controllers/medicalProcessController');

router.get('/getAll', medicalProcessController.getAllMedicalProcesses);
router.post('/create', medicalProcessController.createMedicalProcess);
router.post('/update/:processId', medicalProcessController.updateMedicalProcess);
router.post('/step/create', medicalProcessController.createProcessStep);
router.post('/step/update/:stepId', medicalProcessController.updateProcessStep);

module.exports = router;

