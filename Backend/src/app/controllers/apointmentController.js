const Appointment = require('../models/Appointment');
const HealthPackage = require('../models/HealthPackage');

class AppointmentController {
  // Tạo lịch hẹn
  async createAppointment(req, res) {
    try {
      const { appointmentData } = req.body;
      const { patientId, doctorId, time, specialties, healthPackage, symptoms } = appointmentData;
      
      const newAppointment = new Appointment({
        patientId,
        doctorId,
        time,
        specialties,
        healthPackage,
        symptoms
      });

      const savedAppointment = await newAppointment.save();
      // Populate các trường liên kết trước khi emit và trả về
      const populatedAppointment = await Appointment.findById(savedAppointment._id)
        .populate('patientId')
        .populate('doctorId')
        .populate('specialties')
        .populate('healthPackage');
      // Emit socket event khi tạo lịch hẹn thành công
      const io = req.app.get('io');
      if (io) {
        io.emit('appointment_created', populatedAppointment);
      }
      res.status(201).json(populatedAppointment);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo lịch hẹn', error: error.message });
    }
  }
  
  // Lấy tất cả lịch hẹn
  async getAppointments(req, res) {
    try {
      const appointments = await Appointment.find()
      .populate('patientId')
        .populate('doctorId')
        .populate('specialties')
        .populate('healthPackage');
        
        res.status(200).json(appointments);
      } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch hẹn', error });
    }
  }

  // Lấy chi tiết lịch hẹn theo ID
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('specialties')
      .populate('healthPackage');
      
      if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
      
      res.status(200).json(appointment);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy lịch hẹn', error });
    }
  }
  
  // Huỷ lịch hẹn
  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status: 'cancelled' },
        { new: true }
      );

      if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
      
      res.status(200).json({ message: 'Lịch hẹn đã được huỷ', appointment });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi huỷ lịch hẹn', error });
    }
  }

  // Lấy danh sách gói khám
  async getHealthPackages(req, res) {
    try {
      const packages = await HealthPackage.find({ status: 'active' })
      .populate('service', 'name description')
      .populate('userId', 'name email');
      
      res.status(200).json({ success: true, data: packages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi khi lấy gói khám', error });
    }
  }
  
  // Lấy đặt lịch theo chuyên khoa
  async getAppointmentsBySpecialty(req, res) {
    try {
      const { specialtyId } = req.params;
      const appointments = await Appointment.find({ specialties: specialtyId })
      .populate('doctorId')
      .populate('specialties')
      .populate('healthPackage');
      
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy lịch hẹn theo chuyên khoa', error });
    }
  }
  
  //lấy lịch hẹn theo bệnh nhân
  async getAppointmentsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const appointments = await Appointment.find({ patientId })
      .populate('doctorId')
      .populate('specialties')
      .populate('healthPackage');
      
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy lịch hẹn theo bệnh nhân', error });
    }
  }
  
  async getAppointmentsToday(req, res) {
  try {
    const moment = require('moment-timezone');
    const startOfDay = moment().tz('Asia/Ho_Chi_Minh').startOf('day').toDate();
    const endOfDay = moment().tz('Asia/Ho_Chi_Minh').endOf('day').toDate();

    const appointments = await Appointment.find({
      time: { $gte: startOfDay, $lt: endOfDay },
      status: 'confirmed'
    }).populate('patientId');

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy lịch hẹn hôm nay', error });
  }
}

  // Xác nhận bệnh nhân đã tới khám (confirm)
  async confirmAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status: 'confirmed' },
        { new: true }
      )
      .populate('patientId')
      .populate('doctorId')
      .populate('specialties')
      .populate('healthPackage');
      if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
      // Emit event realtime
      const io = req.app.get('io');
      if (io) {
        io.emit('appointment_confirmed', appointment);
      }
      res.status(200).json({ message: 'Đã xác nhận bệnh nhân tới khám', appointment });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xác nhận lịch hẹn', error });
    }
  }

  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'confirmed', 'in-progress', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }

      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

      res.status(200).json({ message: `Đã cập nhật trạng thái lịch hẹn thành ${status}`, appointment });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái lịch hẹn', error });
    }
  }
}

module.exports = new AppointmentController();
