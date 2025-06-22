const express = require('express');
const router = express.Router();
const patientController = require('../app/controllers/patientController');

router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);

module.exports = router;

