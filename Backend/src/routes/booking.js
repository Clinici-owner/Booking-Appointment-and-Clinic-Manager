const express = require('express');
const router = express.Router();
const bookingController = require('../app/controllers/bookingController');

router.post('/appointments', bookingController.createAppointment);
router.get('/appointments', bookingController.getAppointments);
router.get('/appointments/:id', bookingController.getAppointmentById);
router.put('/appointments/:id/cancel', bookingController.cancelAppointment);
router.get('/health-packages', bookingController.getHealthPackages);

module.exports = router;