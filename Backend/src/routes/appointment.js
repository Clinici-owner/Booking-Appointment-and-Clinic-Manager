const express = require('express');
const router = express.Router();
const appointmentController = require('../app/controllers/apointmentController');

router.post('/create', appointmentController.createAppointment);
router.get('/appointments', appointmentController.getAppointments);
router.get('/specialty/:specialtyId', appointmentController.getAppointmentsBySpecialty);
router.get('/appointments/:id', appointmentController.getAppointmentById);
router.put('/appointments/:id/cancel', appointmentController.cancelAppointment);
router.get('/health-packages', appointmentController.getHealthPackages);

module.exports = router;