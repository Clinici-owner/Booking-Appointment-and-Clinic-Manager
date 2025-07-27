const express = require('express');
const router = express.Router();
const scheduleController = require('../app/controllers/scheduleController');
const multer = require('multer');
const upload = multer();

router.get('/all', scheduleController.getAllSchedules);
// Route lấy tất cả lễ tân
router.get('/nursing', scheduleController.getAllNursing);
router.get('/receptionists', scheduleController.getAllReceptionists);
router.post('/', scheduleController.createSchedule);
router.get('/schedule-by-specialty/:specialtyId', scheduleController.getSchedulesBySpecialtyAndDate);
router.get('/schedule-by-doctor/:doctorId/:shift/:date', scheduleController.getScheduleByIdAndShiftAndDate);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);
router.get('/room/:userId', scheduleController.getTechnicianRoomServices);
router.get('/own/:userId', scheduleController.viewOwnSchedule);
router.get('/view-all', scheduleController.viewAllSchedules);
router.get('/:id', scheduleController.viewScheduleDetail);
router.get('/schedule/:roomId/:day', scheduleController.getSchedulesForRoomAndDay);



module.exports = router;