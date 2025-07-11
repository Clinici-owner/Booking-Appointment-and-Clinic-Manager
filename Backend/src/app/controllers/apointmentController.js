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
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email')
        .populate('specialties', 'name')
        .populate('healthPackage', 'packageName packagePrice');

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
        .populate('patientId', 'name email')
        .populate('doctorId', 'name email')
        .populate('specialties', 'name')
        .populate('healthPackage', 'packageName packagePrice');

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
}

module.exports = new AppointmentController();
