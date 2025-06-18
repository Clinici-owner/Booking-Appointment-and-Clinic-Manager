const express = require('express');
const router = express.Router();
const serviceController = require('../app/controllers/serviceController');

router.post('/', serviceController.createService); 
router.get('/detail', serviceController.detailService);
router.get('/', serviceController.listService);
router.put('/:id', serviceController.editService);
router.patch('/change-status/:id', serviceController.changeStatus);
module.exports = router;

