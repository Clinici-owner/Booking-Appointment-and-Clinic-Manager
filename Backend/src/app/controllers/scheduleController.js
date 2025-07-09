const Schedule = require("../models/Schedule");
const User = require("../models/User");
const Room = require("../models/Room");
const Specialty = require("../models/Specialty");
const DoctorProfile = require("../models/DoctorProfile");
const ParaclinicalService = require("../models/ParaclinicalService");

class ScheduleController {
  async getAllSchedules(req, res) {
    try {
      const schedules = await Schedule.find()
        .populate("userId", "fullName role")
        .populate("room", "roomName roomNumber");
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Tạo lịch trình cho nhân viên: chỉ cần userId, room, shift, date (theo model Schedule)
  async createSchedule(req, res) {
    try {
      let { userId, room, shift, date } = req.body;
      if (!userId || !room || !shift || !date) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc." });
      }
      // Nếu date là string, chuyển thành mảng
      if (typeof date === "string") {
        date = [date];
      }
      if (!Array.isArray(date)) {
        return res.status(400).json({ error: "Ngày không hợp lệ." });
      }
      // Kiểm tra phòng
      const roomObj = await Room.findById(room);
      if (!roomObj)
        return res.status(404).json({ error: "Không tìm thấy phòng." });
      // Tạo nhiều lịch trình nếu date là mảng
      const createdSchedules = [];
      for (const d of date) {
        // Kiểm tra trùng lịch (bác sĩ, ca, ngày)
        const exist = await Schedule.findOne({ userId, shift, date: d });
        if (exist) continue; // Bỏ qua nếu đã có lịch
        const schedule = await Schedule.create({
          userId,
          room,
          shift,
          date: d,
        });
        createdSchedules.push(schedule);
      }
      if (createdSchedules.length === 0) {
        return res.status(400).json({
          error: "Tất cả các lịch trình đã tồn tại hoặc không hợp lệ.",
        });
      }
      res.status(201).json({
        message: `Tạo ${createdSchedules.length} lịch trình thành công.`,
        schedules: createdSchedules,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Chỉnh sửa lịch trình
  async updateSchedule(req, res) {
    try {
      const { id } = req.params;
      const { userId, room, shift, date } = req.body;
      const schedule = await Schedule.findById(id);
      if (!schedule)
        return res.status(404).json({ error: "Không tìm thấy lịch trình." });
      // Kiểm tra trùng lịch nếu đổi bác sĩ, ca, ngày
      if (
        (userId && userId !== String(schedule.userId)) ||
        (shift && shift !== schedule.shift) ||
        (date && date !== schedule.date)
      ) {
        const exist = await Schedule.findOne({
          _id: { $ne: id },
          userId: userId || schedule.userId,
          shift: shift || schedule.shift,
          date: date || schedule.date,
        });
        if (exist)
          return res
            .status(400)
            .json({ error: "Bác sĩ đã có lịch trình ca này." });
      }
      if (userId) schedule.userId = userId;
      if (room) schedule.room = room;
      if (shift) schedule.shift = shift;
      if (date) schedule.date = date;
      await schedule.save();
      res.json({ message: "Cập nhật lịch trình thành công.", schedule });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Xóa lịch trình
  async deleteSchedule(req, res) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findByIdAndDelete(id);
      if (!schedule)
        return res.status(404).json({ error: "Không tìm thấy lịch trình." });
      res.json({ message: "Xóa lịch trình thành công." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async viewOwnSchedule(req, res) {
    try {
      const routeUserId = req.params.userId;
      if (!routeUserId) {
        return res
          .status(400)
          .json({ message: "Thiếu ID người dùng trong URL." });
      }
      const { room } = req.query;
      const query = { userId: routeUserId };
      if (room) {
        query.room = room;
      }
      const schedules = await Schedule.find(query)
        .populate("userId", "fullName role")
        .populate("room", "roomName roomNumber shift")
        .sort({ date: 1 });
      if (schedules.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy lịch trình cho người dùng này." });
      }
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({
        error: `Lỗi server khi lấy lịch trình cá nhân: ${error.message}`,
      });
    }
  }

  async viewAllSchedules(req, res) {
    try {
      const { room, searchName, page = 1, limit = 10 } = req.query;
      const query = {};
      if (room) {
        query.room = room;
      }
      if (searchName) {
        const users = await User.find({
          fullName: { $regex: searchName, $options: "i" },
        }).select("_id");
        const userIds = users.map((user) => user._id);
        if (userIds.length > 0) {
          query.userId = { $in: userIds };
        } else {
          return res.status(200).json({
            schedules: [],
            totalSchedules: 0,
            totalPages: 0,
            currentPage: 1,
          });
        }
      }
      const totalSchedules = await Schedule.countDocuments(query);
      const totalPages = Math.ceil(totalSchedules / limit);
      const skip = (page - 1) * limit;
      const schedules = await Schedule.find(query)
        .populate("userId", "fullName")
        .populate("room", "roomName roomNumber")
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit);
      res.status(200).json({
        schedules,
        totalSchedules,
        totalPages,
        currentPage: parseInt(page),
      });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi server khi lấy danh sách lịch trình. Vui lòng thử lại sau.",
      });
    }
  }

  async viewScheduleDetail(req, res) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.findById(id)
        .populate("userId", "fullName")
        .populate("room", "roomName roomNumber");
      if (!schedule) {
        return res.status(404).json({ error: "Không tìm thấy lịch trình." });
      }
      res.status(200).json({ schedule });
    } catch (error) {
      res.status(500).json({
        error: "Lỗi server khi lấy chi tiết lịch trình. Vui lòng thử lại sau.",
      });
    }
  }
  async getSchedulesForRoomAndDay(req, res) {
    try {
      const { roomId, day } = req.params; // Nhận dữ liệu từ URL
      if (!roomId || !day) {
        return res
          .status(400)
          .json({ error: "Thiếu thông tin phòng hoặc ngày." });
      }

      // Tìm lịch trình cho phòng và ngày
      const schedules = await Schedule.find({
        room: roomId,
        date: day,
      })
        .populate("userId", "fullName role") // Để lấy thông tin bác sĩ
        .populate("room", "roomName roomNumber"); // Để lấy thông tin phòng

      // Trả về kết quả tìm được
      res.status(200).json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTechnicianRoomServices(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(400)
          .json({ message: "Thiếu userId trong request body." });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
      }

      if (user.role === "patient") {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền truy cập." });
      }

      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      const todaySchedule = await Schedule.findOne({
        userId: userId,
        date: { $gte: startOfDay, $lte: endOfDay },
      }).populate("room");

      if (!todaySchedule) {
        return res
          .status(404)
          .json({ message: "Không có lịch làm việc hôm nay." });
      }

      const room = todaySchedule.room;

      const services = await ParaclinicalService.find({
        room: room._id,
        status: "available",
      });
      console.log(services);

      const serviceNames = services.map((service) => service.paraclinalName);

      const fullQueue = await User.find({
        _id: { $in: room.patientQueue },
      }).select("fullName email");

      return res.status(200).json({
        roomNumber: room.roomNumber,
        roomName: room.roomName,
        services: serviceNames,
        patientQueue: fullQueue,
      });
    } catch (error) {
      console.error("Lỗi StepProcessController:", error);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
  }

  // Lấy lịch trình của tất cả bác sĩ theo chuyên khoa và theo ngày hiện tại trở về sau và sắp xếp theo ngày
  async getSchedulesBySpecialtyAndDate(req, res) {
    try {
      const { specialtyId } = req.params;

      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      //lấy tất cả các lịch
      const schedules = await Schedule.find({
        date: { $gte: startOfDay},
      })
        .populate("userId")
        .populate("room");

      // Lấy thông tin doctorProfile và specialty
      const doctorProfiles = await DoctorProfile.find({
        specialties: specialtyId,
      }).populate("specialties");

      // Lấy danh sách bác sĩ theo chuyên khoa
      const doctorIds = doctorProfiles.map((profile) => profile.doctorId);

      // Lọc lịch trình theo danh sách bác sĩ
      const doctorIdStrings = doctorIds.map((id) => id.toString());
      const filteredSchedules = schedules.filter((schedule) => {
        return doctorIdStrings.includes(schedule.userId._id.toString());
      });

      console.log("filteredSchedules:", filteredSchedules.length);
      
      // lấy lịch theo role là bác sĩ
      const schedulesByDoctor = filteredSchedules.filter((schedule) => {
        return schedule.userId.role === "doctor";
      });

      // Sắp xếp lịch trình theo ngày
      schedulesByDoctor.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      res.status(200).json(schedulesByDoctor);
    } catch (error) {
      console.error("Lỗi khi lấy lịch trình:", error);
      res.status(500).json({ message: "Lỗi máy chủ" });
    }
  }
}

module.exports = new ScheduleController();
