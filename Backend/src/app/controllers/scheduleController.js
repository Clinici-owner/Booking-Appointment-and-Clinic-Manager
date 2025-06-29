const Schedule = require('../models/Schedule');
const User = require('../models/User');
const ParaclinicalService = require('../models/ParaclinicalService');

class ScheduleController {
    async createSchedule(req, res) {
        try {
            console.log('Received request at /api/schedules. Request body:', req.body);
            // Removed admin check since this is an admin-only route

            const { userId, startTime, endTime, roomNumber, paraclinicalId } = req.body;

            // Validate required fields
            if (!userId || !startTime || !endTime || !roomNumber || !paraclinicalId) {
                console.log('Missing required fields:', { userId, startTime, endTime, roomNumber, paraclinicalId });
                return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: userId, startTime, endTime, roomNumber, paraclinicalId.' });
            }

            // Validate user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Không tìm thấy nhân viên.' });
            }
            if (!['doctor', 'technician', 'receptionist'].includes(user.role)) {
                return res.status(400).json({ error: 'Chỉ bác sĩ, kỹ thuật viên hoặc lễ tân được phân công lịch trình.' });
            }

            // Validate service
            const service = await ParaclinicalService.findById(paraclinicalId);
            if (!service) {
                return res.status(404).json({ error: 'Không tìm thấy dịch vụ cận lâm sàng.' });
            }
            if (service.status !== 'available') {
                return res.status(400).json({ error: 'Dịch vụ cận lâm sàng không khả dụng.' });
            }
            if (service.roomNumber !== roomNumber) {
                return res.status(400).json({ error: 'Số phòng phải khớp với phòng của dịch vụ cận lâm sàng.' });
            }

            // Validate and parse dates
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.log('Invalid date format:', { startTime, endTime });
                return res.status(400).json({ error: 'Thời gian bắt đầu hoặc kết thúc không hợp lệ.' });
            }
            if (start >= end) {
                return res.status(400).json({ error: 'Thời gian bắt đầu phải trước thời gian kết thúc.' });
            }

            // Check for conflicting schedules
            const conflictingSchedules = await Schedule.find({
                $or: [
                    { userId, startTime: { $lt: end }, endTime: { $gt: start } },
                    { roomNumber, startTime: { $lt: end }, endTime: { $gt: start } }
                ]
            });
            if (conflictingSchedules.length > 0) {
                console.log('Conflicting schedules found:', conflictingSchedules);
                return res.status(400).json({ error: 'Lịch trình xung đột với lịch hiện có của nhân viên hoặc phòng.' });
            }

            // Create and save schedule
            const schedule = new Schedule({
                userId,
                startTime: start,
                endTime: end,
                roomNumber,
                paraclinicalId
            });

            await schedule.save();
            const populatedSchedule = await Schedule.findById(schedule._id)
                .populate('userId', 'fullName')
                .populate('paraclinicalId', 'paraclinalName');

            console.log('Schedule created successfully:', populatedSchedule);
            res.status(201).json({ message: 'Lịch trình đã được tạo thành công.', schedule: populatedSchedule });

        } catch (error) {
            console.error('Server error in createSchedule:', error.stack);
            res.status(500).json({ error: `Lỗi server: ${error.message}` });
        }
    }

    async updateSchedule(req, res) {
        try {
            // Removed admin check since this is an admin-only route

            const { id } = req.params;
            const updateData = req.body;

            const existingSchedule = await Schedule.findById(id);
            if (!existingSchedule) {
                return res.status(404).json({ error: 'Không tìm thấy lịch trình.' });
            }

            // Validate and parse dates if provided in updateData
            if (updateData.startTime || updateData.endTime) {
                const start = new Date(updateData.startTime || existingSchedule.startTime);
                const end = new Date(updateData.endTime || existingSchedule.endTime);

                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return res.status(400).json({ error: 'Thời gian bắt đầu hoặc kết thúc không hợp lệ.' });
                }
                if (start >= end) {
                    return res.status(400).json({ error: 'Thời gian bắt đầu phải trước thời gian kết thúc.' });
                }
                // Update dates in updateData for consistency before Mongoose update
                updateData.startTime = start;
                updateData.endTime = end;
            }

            // Validate userId if provided
            if (updateData.userId) {
                const user = await User.findById(updateData.userId);
                if (!user) {
                    return res.status(404).json({ error: 'Không tìm thấy nhân viên.' });
                }
                if (!['doctor', 'technician', 'receptionist'].includes(user.role)) {
                    return res.status(400).json({ error: 'Chỉ bác sĩ, kỹ thuật viên hoặc lễ tân được phân công lịch trình.' });
                }
            }

            // Validate paraclinicalId and roomNumber if provided
            if (updateData.paraclinicalId) {
                const service = await ParaclinicalService.findById(updateData.paraclinicalId);
                if (!service) {
                    return res.status(404).json({ error: 'Không tìm thấy dịch vụ cận lâm sàng.' });
                }
                if (service.status !== 'available') {
                    return res.status(400).json({ error: 'Dịch vụ cận lâm sàng không khả dụng.' });
                }
                // If roomNumber is also being updated, check if it matches the service's roomNumber
                if (updateData.roomNumber && service.roomNumber !== updateData.roomNumber) {
                    return res.status(400).json({ error: 'Số phòng phải khớp với phòng của dịch vụ cận lâm sàng.' });
                }
                // If paraclinicalId is updated but roomNumber is not provided, update roomNumber from service
                if (!updateData.roomNumber) {
                    updateData.roomNumber = service.roomNumber;
                }
            } else if (updateData.roomNumber && !updateData.paraclinicalId) {
                // If only roomNumber is updated, ensure it matches the current service's roomNumber
                const service = await ParaclinicalService.findById(existingSchedule.paraclinicalId);
                if (!service) {
                    return res.status(400).json({ error: 'Không tìm thấy dịch vụ cận lâm sàng cho lịch trình hiện có.' });
                }
                if (service.roomNumber !== updateData.roomNumber) {
                    return res.status(400).json({ error: 'Số phòng phải khớp với phòng của dịch vụ cận lâm sàng hiện tại.' });
                }
            }

            // Check for conflicting schedules with updated data
            // Use logical OR (||) to get the most current value (updated or existing)
            const checkUserId = updateData.userId || existingSchedule.userId;
            const checkRoomNumber = updateData.roomNumber || existingSchedule.roomNumber;
            const checkStartTime = new Date(updateData.startTime || existingSchedule.startTime);
            const checkEndTime = new Date(updateData.endTime || existingSchedule.endTime);

            const conflictingSchedules = await Schedule.find({
                _id: { $ne: id }, // Exclude the current schedule being updated
                $or: [
                    { userId: checkUserId, startTime: { $lt: checkEndTime }, endTime: { $gt: checkStartTime } },
                    { roomNumber: checkRoomNumber, startTime: { $lt: checkEndTime }, endTime: { $gt: checkStartTime } }
                ]
            });
            if (conflictingSchedules.length > 0) {
                return res.status(400).json({ error: 'Lịch trình xung đột với lịch hiện có của nhân viên hoặc phòng.' });
            }

            const updatedSchedule = await Schedule.findByIdAndUpdate(id, updateData, { new: true })
                .populate('userId', 'fullName')
                .populate('paraclinicalId', 'paraclinalName');

            if (!updatedSchedule) {
                return res.status(404).json({ error: 'Không tìm thấy lịch trình để cập nhật sau tìm kiếm.' });
            }

            res.json({ message: 'Cập nhật lịch trình thành công.', schedule: updatedSchedule });

        } catch (error) {
            console.error('Server error in updateSchedule:', error.stack);
            res.status(500).json({ error: `Lỗi server: ${error.message}` });
        }
    }

    async deleteSchedule(req, res) {
        try {
            // Removed admin check since this is an admin-only route

            const { id } = req.params;

            const schedule = await Schedule.findByIdAndDelete(id);
            if (!schedule) {
                return res.status(404).json({ error: 'Không tìm thấy lịch trình.' });
            }

            res.json({ message: 'Xóa lịch trình thành công.' });

        } catch (error) {
            console.error('Server error in deleteSchedule:', error.stack);
            res.status(500).json({ error: `Lỗi server: ${error.message}` });
        }
    }

    
      async viewOwnSchedule(req, res) {
    try {
        const routeUserId = req.params.userId;
        console.log('Route User ID:', routeUserId, 'Time:', new Date().toLocaleString('vi-VN'));

        if (!routeUserId) {
            return res.status(400).json({ message: 'Thiếu ID người dùng trong URL.' });
        }

        const { roomNumber } = req.query;

        const query = { userId: routeUserId };
        if (roomNumber) {
            query.roomNumber = roomNumber;
        }

        const schedules = await Schedule.find(query)
            .populate('userId', 'fullName role')
            .populate('paraclinicalId', 'paraclinalName roomNumber')
            .sort({ startTime: 1 });

        if (schedules.length === 0) {
            console.log('Không tìm thấy lịch trình cho userId:', routeUserId);
            return res.status(404).json({ message: 'Không tìm thấy lịch trình cho người dùng này.' });
        }

        res.status(200).json(schedules);
    } catch (error) {
        console.error('Server error in viewOwnSchedule:', error.stack);
        res.status(500).json({ error: `Lỗi server khi lấy lịch trình cá nhân: ${error.message}` });
    }
}


    async viewAllSchedules(req, res) {
        try {
            const { roomNumber, searchName, page = 1, limit = 10 } = req.query; // Lấy page và limit

            const query = {};
            if (roomNumber) {
                query.roomNumber = roomNumber;
            }

            // Tạo query để tìm kiếm theo fullName của userId
            if (searchName) {
                const users = await User.find({ fullName: { $regex: searchName, $options: 'i' } }).select('_id');
                const userIds = users.map(user => user._id);
                if (userIds.length > 0) {
                    query.userId = { $in: userIds };
                } else {
                    // Nếu không tìm thấy người dùng nào khớp với searchName, trả về mảng rỗng
                    return res.status(200).json({ schedules: [], totalSchedules: 0, totalPages: 0, currentPage: 1 });
                }
            }
            
            // Tính toán phân trang
            const totalSchedules = await Schedule.countDocuments(query);
            const totalPages = Math.ceil(totalSchedules / limit);
            const skip = (page - 1) * limit;

            const schedules = await Schedule.find(query)
                .populate('userId', 'fullName')
                .populate('paraclinicalId', 'paraclinalName roomNumber')
                .sort({ startTime: 1 })
                .skip(skip)
                .limit(limit);

            res.status(200).json({ schedules, totalSchedules, totalPages, currentPage: parseInt(page) });
        } catch (error) {
            console.error('Server error in viewAllSchedules:', error.stack);
            res.status(500).json({ error: 'Lỗi server khi lấy danh sách lịch trình. Vui lòng thử lại sau.' });
        }
    }

    async viewScheduleDetail(req, res) {
        try {
            const { id } = req.params;

            const schedule = await Schedule.findById(id)
                .populate('userId', 'fullName')
                .populate('paraclinicalId', 'paraclinalName roomNumber');

            if (!schedule) {
                return res.status(404).json({ error: 'Không tìm thấy lịch trình.' });
            }

            res.status(200).json({ schedule });
        } catch (error) {
            console.error('Server error in getScheduleById:', error.stack);
            res.status(500).json({ error: 'Lỗi server khi lấy chi tiết lịch trình. Vui lòng thử lại sau.' });
        }
    }
}

module.exports = new ScheduleController();