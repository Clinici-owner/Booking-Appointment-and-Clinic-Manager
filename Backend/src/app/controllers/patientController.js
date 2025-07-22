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
    async createPatient(req, res) {
        const { fullName,  cidNumber } = req.body;
        try {
            const existingPatient = await User.findOne({       
                cidNumber: cidNumber,
                role: "patient"
            });
            if (existingPatient) {
                return res.status(400).json({ message: "Patient already exists" });
            }
            const newPatient = new User({
                fullName,
                cidNumber,
                role: "patient"
            });
            await newPatient.save();
            res.status(201).json({ message: "Patient created successfully" });
        } catch (error) {
            console.error("Error creating patient:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
module.exports = new patientController();