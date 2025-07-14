const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const Specialty = require("../models/Specialty");
const bcrypt = require("bcrypt");
class doctorController {
  async getDoctorProfileByDoctorId(req, res) {
    const { id } = req.params;
    try {
      const doctorProfile = await DoctorProfile.findOne({
        doctorId: id,
      }).populate("certificateId specialties doctorId");
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.status(200).json(doctorProfile);
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateDoctorProfile(req, res) {
    const { id } = req.params;
    const { certificateId, description, yearsOfExperience, specialties } =
      req.body;
    try {
      const doctorProfile = await DoctorProfile.findOne({ doctorId: id });
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      doctorProfile.certificateId = certificateId;
      doctorProfile.description = description;
      doctorProfile.yearsOfExperience = yearsOfExperience;
      doctorProfile.specialties = specialties;
      await doctorProfile.save();
      res.status(200).json(doctorProfile);
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async createDoctorProfile(req, res) {
    const {
      doctorId,
      certificateId,
      description,
      yearsOfExperience,
      specialties,
    } = req.body;
    try {
      const existingProfile = await DoctorProfile.findOne({
        doctorId: doctorId,
      });
      if (existingProfile) {
        return res
          .status(400)
          .json({ message: "Doctor profile already exists" });
      }
      const newProfile = new DoctorProfile({
        doctorId,
        certificateId,
        description,
        yearsOfExperience,
        specialties,
      });
      await newProfile.save();
      res.status(201).json(newProfile);
    } catch (error) {
      console.error("Error creating doctor profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // get doctor by specialty
  async getDoctorsBySpecialty(req, res) {
    const { specialtyId } = req.params;
    try {
      const doctors = await DoctorProfile.find({
        specialties: specialtyId,
      }).populate("doctorId specialties");
      if (!doctors || doctors.length === 0) {
        return res
          .status(404)
          .json({ message: "No doctors found for this specialty" });
      }
      res.status(200).json(doctors);
    } catch (error) {
      console.error("Error fetching doctors by specialty:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteDoctorProfile(req, res) {
    const { id } = req.params;
    try {
      const doctorProfile = await DoctorProfile.findOneAndDelete({
        doctorId: id,
      });
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting doctor profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async listAllDoctors(req, res) {
    try {
    // Tìm tất cả user có role là 'doctor'
    const doctorUsers = await User.find({ role: 'doctor' })
      .select('-password -otp -otpExpires') // Loại bỏ các trường nhạy cảm
      .lean(); // Chuyển sang plain object

    // Nếu không tìm thấy bác sĩ nào
    if (!doctorUsers || doctorUsers.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Không tìm thấy bác sĩ nào'
      });
    }

    // Lấy danh sách ID của các bác sĩ
    const doctorIds = doctorUsers.map(user => user._id);

    // Tìm các profile tương ứng
    const doctorProfiles = await DoctorProfile.find({ doctorId: { $in: doctorIds } })
      .populate('specialties', 'specialtyName logo')
      .populate('certificateId', 'url type')
      .lean();

    // Kết hợp thông tin user và profile
    const doctors = doctorUsers.map(user => {
      const profile = doctorProfiles.find(p => p.doctorId.toString() === user._id.toString()) || {};
      return {
        ...user,
        profile: {
          description: profile.description || '',
          yearsOfExperience: profile.yearsOfExperience || 0,
          specialties: profile.specialties || [],
          certificates: profile.certificateId || []
        }
      };
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error('Error listing doctors:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
  async getDoctorById(req, res) {
    const { id } = req.params;
    try {
      const doctor = await User.findById(id)
        .select('-password -otp -otpExpires') // Loại bỏ các trường nhạy cảm
        .lean();
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      const doctorProfile = await DoctorProfile.findOne({ doctorId: id })
        .populate('specialties', 'specialtyName logo')
        .populate('certificateId', 'url type')
        .lean();
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.status(200).json({
        ...doctor,
        profile: {
          description: doctorProfile.description || '',
          yearsOfExperience: doctorProfile.yearsOfExperience || 0,
          specialties: doctorProfile.specialties || [],
          certificates: doctorProfile.certificateId || []
        }
      });
    }
    catch (error) {
      console.error("Error fetching doctor by ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
}
}
module.exports = new doctorController();
