const express = require('express');
const router = express.Router();
const serviceController = require('../app/controllers/serviceController');

router.post('/', serviceController.createService);
router.get('/:serviceId', serviceController.detailService); 
router.get('/', serviceController.listService);
router.put('/:serviceId', serviceController.editService);
router.patch('/change-status/:id', serviceController.changeStatus);
router.get('/search', serviceController.searchServiceByName);

module.exports = router;
