const express = require('express');
const router = express.Router();
const appointmentController = require('../app/controllers/apointmentController');

router.get('/today', appointmentController.getAppointmentsToday);
router.post('/create', appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);
router.get('/specialty/:specialtyId', appointmentController.getAppointmentsBySpecialty);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id/cancel', appointmentController.cancelAppointment);
router.put('/:id/confirm', appointmentController.confirmAppointment);
router.get('/health-packages', appointmentController.getHealthPackages); 
router.post('/update-status/:id', appointmentController.updateAppointmentStatus);

module.exports = router;