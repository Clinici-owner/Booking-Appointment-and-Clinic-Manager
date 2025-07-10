const express = require('express');
const router = express.Router();
const medicalProcessController = require('../app/controllers/medicalProcessController');

router.get('/getAll', medicalProcessController.getAllMedicalProcesses);
router.post('/create', medicalProcessController.createMedicalProcess);
router.post('/update/:processId', medicalProcessController.updateMedicalProcess);
router.post('/updateStatus/:processId', medicalProcessController.updateMedicalProcessStatus);
router.get('/:processId', medicalProcessController.getMedicalProcessById);

router.post('/step/create', medicalProcessController.createProcessStep);

router.post('/complete-step/:userId', medicalProcessController.completeCurrentStep);
router.get("/my-process/:userId", medicalProcessController.getPatientMedicalProcess);
module.exports = router;

