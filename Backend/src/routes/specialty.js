const express = require('express');
const router = express.Router();
const specialtyController = require('../app/controllers/specialtyController');

router.post('/create', specialtyController.createSpecialty);
router.get('/getAll', specialtyController.getAllSpecialties);

module.exports = router;