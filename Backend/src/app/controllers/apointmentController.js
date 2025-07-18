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
      res.status(201).json(savedAppointment);
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
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      const appointments = await Appointment.find({
        time: { $gte: startOfDay, $lt: endOfDay },
        status: 'confirmed'
      })
      .populate('patientId');
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy lịch hẹn hôm nay', error });
    }
  }
  // Lấy danh sách đặt lịch của bệnh nhân, có thể filter theo ngày
  async getAppointmentsByPatientAndDate(req, res) {
    try {
      const { patientId } = req.params;
      const { date } = req.query;
      let query = { patientId };
      if (date) {
        // Lọc theo ngày (so sánh trong ngày đó)
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.time = { $gte: startOfDay, $lt: endOfDay };
      }
      const appointments = await Appointment.find(query)
        .populate('doctorId')
        .populate('specialties')
        .populate('healthPackage');
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy lịch hẹn theo bệnh nhân và ngày', error });
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
      );
      if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
      res.status(200).json({ message: 'Đã xác nhận bệnh nhân tới khám', appointment });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xác nhận lịch hẹn', error });
    }
  }
}

module.exports = new AppointmentController();
