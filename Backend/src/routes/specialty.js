const express = require('express');
const router = express.Router();
const specialtyController = require('../app/controllers/specialtyController');

router.get('/', specialtyController.getAllSpecialties);
router.get('/:id', specialtyController.getSpecialtyById);
router.put('/lock/:id', specialtyController.lockSpecialty);
router.post('/create', specialtyController.createSpecialty);

module.exports = router;