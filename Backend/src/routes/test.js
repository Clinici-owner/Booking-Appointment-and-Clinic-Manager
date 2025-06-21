const express = require('express');
const router = express.Router();
const testController = require('../app/controllers/testController');

router.post('/createMedicalHistory', testController.createMedicalHistory);
router.post('/createResultParaclinical', testController.createResultParaclinical);

module.exports = router;

