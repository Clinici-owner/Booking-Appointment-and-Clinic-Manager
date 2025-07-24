const express = require('express');
const router = express.Router();
const paymentController = require('../app/controllers/paymentController');

router.post('/createPayment', paymentController.createPayment);
router.get('/appointment/:appointmentId', paymentController.getPaymentByAppointmentId);
router.get('/:id', paymentController.getPayment);
router.put('/:id', paymentController.updatePayment);

module.exports = router;