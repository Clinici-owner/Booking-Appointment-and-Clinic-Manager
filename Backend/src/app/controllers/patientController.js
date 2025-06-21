const User = require("../models/User");
const bcrypt = require("bcrypt");
class patientController {
  
    async getAllPatients(req, res) {
        try {
            const patients = await User.find({ role: "patient" }).select("-password");
            res.status(200).json(patients);
        } catch (error) {
            console.error("Error fetching patients:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getPatientById(req, res) {
        const { id } = req.params; 
        try {
            const patient = await User.findById(id).select("-password");
            if (!patient) {
                return res.status(404).json({ message: "Patient not found" });
            }
            res.status(200).json(patient);
        } catch (error) {
            console.error("Error fetching patient:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
module.exports = new patientController();