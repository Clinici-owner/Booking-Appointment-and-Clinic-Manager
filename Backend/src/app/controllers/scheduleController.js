
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Room = require('../models/Room');
const Specialty = require('../models/Specialty');
const DoctorProfile = require('../models/DoctorProfile');

class ScheduleController {
    // Lấy danh sách lịch trình của tất cả nhân viên
    async getAllSchedules(req, res) {
        try {
            const schedules = await Schedule.find()
                .populate('userId', 'fullName role')
                .populate('room', 'roomName')
                .populate('specialties', 'specialtyName');
            res.status(200).json(schedules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Tạo lịch trình cho nhân viên: chọn chuyên khoa, ca làm, bác sĩ
    async createSchedule(req, res) {
        try {
            const { specialtyId, userId, roomId, shift, date } = req.body;
            if (!specialtyId || !userId || !roomId || !shift || !date) {
                return res.status(400).json({ error: 'Thiếu thông tin bắt buộc.' });
            }
            // Kiểm tra chuyên khoa
            const specialty = await Specialty.findById(specialtyId);
            if (!specialty) return res.status(404).json({ error: 'Không tìm thấy chuyên khoa.' });
            // Kiểm tra nhân viên
            const user = await User.findById(userId);
            if (!user || user.role !== 'doctor') return res.status(404).json({ error: 'Không tìm thấy bác sĩ.' });
            // Kiểm tra phòng
            const room = await Room.findById(roomId);
            if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng.' });
            // Kiểm tra trùng lịch
            const exist = await Schedule.findOne({ userId, date, shift });
            if (exist) return res.status(400).json({ error: 'Bác sĩ đã có lịch trình ca này.' });
            // Tạo lịch trình
            const schedule = await Schedule.create({
                userId,
                room: roomId,
                specialties: specialtyId,
                shift,
                date
            });
            res.status(201).json({ message: 'Tạo lịch trình thành công.', schedule });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy danh sách bác sĩ theo chuyên khoa
    async getDoctorsBySpecialty(req, res) {
        try {
            const { specialtyId } = req.params;
            if (!specialtyId) return res.status(400).json({ error: 'Thiếu chuyên khoa.' });
            const doctors = await DoctorProfile.find({ specialties: specialtyId })
                .populate('doctorId', 'fullName');
            res.status(200).json(doctors.map(d => d.doctorId));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Chỉnh sửa lịch trình
    async updateSchedule(req, res) {
        try {
            const { id } = req.params;
            const { specialtyId, userId, roomId, shift, date } = req.body;
            const schedule = await Schedule.findById(id);
            if (!schedule) return res.status(404).json({ error: 'Không tìm thấy lịch trình.' });
            // Kiểm tra trùng lịch nếu đổi bác sĩ, ca, ngày
            if ((userId && userId !== String(schedule.userId)) || (shift && shift !== schedule.shift) || (date && date !== schedule.date)) {
                const exist = await Schedule.findOne({
                    _id: { $ne: id },
                    userId: userId || schedule.userId,
                    shift: shift || schedule.shift,
                    date: date || schedule.date
                });
                if (exist) return res.status(400).json({ error: 'Bác sĩ đã có lịch trình ca này.' });
            }
            if (specialtyId) schedule.specialties = specialtyId;
            if (userId) schedule.userId = userId;
            if (roomId) schedule.room = roomId;
            if (shift) schedule.shift = shift;
            if (date) schedule.date = date;
            await schedule.save();
            res.json({ message: 'Cập nhật lịch trình thành công.', schedule });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Xóa lịch trình
    async deleteSchedule(req, res) {
        try {
            const { id } = req.params;
            const schedule = await Schedule.findByIdAndDelete(id);
            if (!schedule) return res.status(404).json({ error: 'Không tìm thấy lịch trình.' });
            res.json({ message: 'Xóa lịch trình thành công.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
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