const express = require('express');
const router = express.Router();
const medicalProcessController = require('../app/controllers/medicalProcessController');

router.get('/getAll', medicalProcessController.getAllMedicalProcesses);
router.post('/create', medicalProcessController.createMedicalProcess);
router.post('/update/:processId', medicalProcessController.updateMedicalProcess);
router.post('/updateStatus/:processId', medicalProcessController.updateMedicalProcessStatus);
router.get('/:processId', medicalProcessController.getMedicalProcessById);

router.post('/step/create', medicalProcessController.createProcessStep);

module.exports = router;

