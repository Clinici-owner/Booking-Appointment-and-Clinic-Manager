const User = require("../models/User");
const MedicalHistory = require("../models/MedicalHistory");
const ResultParaclinical = require("../models/ResultParaclinical");
const bcrypt = require("bcrypt");
class testController {

    async createMedicalHistory(req, res) {
        const { patientId, doctorId, initialDiagnosis, diagnosis, status, service, resultParaclinical} = req.body;
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

    async createResultParaclinical(req, res) {
        const { fileResult } = req.body;
        try {
            const resultParaclinical = new ResultParaclinical({
                fileResult
            });
            await resultParaclinical.save();
            res.status(201).json(resultParaclinical);
        } catch (error) {
            console.error("Error creating result paraclinical:", error);
            res.status(500).json({ message: "Internal server error" });
        }   
    }

}
module.exports = new testController();