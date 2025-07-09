const express = require('express');
const router = express.Router();
const scheduleController = require('../app/controllers/scheduleController');

router.get('/all', scheduleController.getAllSchedules);
router.post('/', scheduleController.createSchedule);
router.get('/schedule-by-specialty/:specialtyId', scheduleController.getSchedulesBySpecialtyAndDate);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);
router.get('/own/:userId', scheduleController.viewOwnSchedule);
router.get('/view-all', scheduleController.viewAllSchedules);
router.get('/:id', scheduleController.viewScheduleDetail);
router.get('/schedule/:roomId/:day', scheduleController.getSchedulesForRoomAndDay);

router.get('/room', scheduleController.getTechnicianRoomServices);

module.exports = router;