const express = require('express');
const router = express.Router();
const serviceController = require('../app/controllers/serviceController');

router.post('/', serviceController.createService); 
router.get('/detail', serviceController.detailService);
module.exports = router;

