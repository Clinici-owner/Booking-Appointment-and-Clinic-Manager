const User = require("../models/User");
const DoctorProfile = require("../models/DoctorProfile");
const bcrypt = require("bcrypt");
class doctorController {
  async getDoctorProfileByDoctorId(req, res) {
    const { id } = req.params;
    try {
      const doctorProfile = await DoctorProfile.findOne({ doctorId: id })
        .populate("certificateId");
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
        specialties
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
      const doctors = await DoctorProfile.find({ specialties: specialtyId })
        .populate("doctorId specialties");
      if (!doctors || doctors.length === 0) {
        return res.status(404).json({ message: "No doctors found for this specialty" });
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
      const doctorProfile = await DoctorProfile.findOneAndDelete({ doctorId: id });
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting doctor profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
module.exports = new doctorController();
