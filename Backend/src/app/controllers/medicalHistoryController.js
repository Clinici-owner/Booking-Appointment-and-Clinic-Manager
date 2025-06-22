const User = require("../models/User");
const MedicalHistory = require("../models/MedicalHistory");
const bcrypt = require("bcrypt");
class medicalHistoryController {
  
    async createMedicalHistory(req, res) {
        const { patientId, doctorId, initialDiagnosis, diagnosis, status, service, resultParaclinical } = req.body;
        try {
            const medicalHistory = new MedicalHistory({
                patientId,
                doctorId,
                initialDiagnosis,
                diagnosis,
                status: status || 'complete',
                service,
                resultParaclinical: resultParaclinical || []
            });
            await medicalHistory.save();
            res.status(201).json(medicalHistory);
        } catch (error) {
            console.error("Error creating medical history:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getMedicalHistoryByPatientId(req, res) {
        const { id } = req.params;
        try {
            const medicalHistories = await MedicalHistory.find({ patientId: id })
                .populate('doctorId', 'fullName email') // Populate doctor details
                .populate('resultParaclinical') // Populate result paraclinical details
                .populate('service') // Populate service details
                .populate('patientId', 'fullName email'); // Populate patient details
            if (!medicalHistories || medicalHistories.length === 0) {
                return res.status(404).json({ message: "No medical history found for this patient" });
            }
            res.status(200).json(medicalHistories);
        } catch (error) {
            console.error("Error fetching medical history:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
module.exports = new medicalHistoryController();