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

}
module.exports = new patientController();