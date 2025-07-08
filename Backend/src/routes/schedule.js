const express = require('express');
const router = express.Router();
const scheduleController = require('../app/controllers/scheduleController');

// Lấy tất cả lịch trình nhân viên (có populate chuyên khoa, phòng, bác sĩ)
router.get('/all', scheduleController.getAllSchedules);
// Tạo lịch trình: chọn chuyên khoa, ca làm, bác sĩ
router.post('/', scheduleController.createSchedule);
// Lấy danh sách bác sĩ theo chuyên khoa
// Sửa lịch trình
router.put('/:id', scheduleController.updateSchedule);
// Xóa lịch trình
router.delete('/:id', scheduleController.deleteSchedule);

// Các route cũ nếu cần giữ lại cho các mục đích khác:
router.get('/own/:userId', scheduleController.viewOwnSchedule);
router.get('/view-all', scheduleController.viewAllSchedules);
router.get('/:id', scheduleController.viewScheduleDetail);
router.get('/schedule/:roomId/:day', scheduleController.getSchedulesForRoomAndDay);

//Lấy lịch làm việc cho 1 userID
router.get('/room', scheduleController.getTechnicianRoomServices);

module.exports = router;