const express = require('express');
const router = express.Router();
const scheduleController = require('../app/controllers/scheduleController');

router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);
router.get('/own/:userId', scheduleController.viewOwnSchedule);
router.get('/all', scheduleController.viewAllSchedules);
router.get('/:id', scheduleController.viewScheduleDetail);

module.exports = router;