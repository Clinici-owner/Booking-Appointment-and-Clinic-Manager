const MedicalProcess = require('../models/medicalProcessModel');
const ProcessStep = require('../models/processStepModel');

class medicalProcessController {

    async createProcessStep(req, res) {
        const { serviceId, notes } = req.body;
        try {
            const processStep = new ProcessStep({
                serviceId,
                notes
            });
            await processStep.save();
            res.status(201).json(processStep);
        } catch (error) {
            console.error("Error creating process step:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async updateProcessStep(req, res) {
        const { stepId } = req.params;
        const { isCompleted, notes } = req.body;
        try {
            const processStep = await ProcessStep.findByIdAndUpdate(
                stepId,
                { isCompleted, notes },
                { new: true }
            );
            if (!processStep) {
                return res.status(404).json({ message: "Process step not found" });
            }
            res.status(200).json(processStep);
        } catch (error) {
            console.error("Error updating process step:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getAllMedicalProcesses(req, res) {
        try {
            const medicalProcesses = await MedicalProcess.find()
                .populate('patientId')
                .populate('doctorId')
                .populate({
                    path: 'processSteps',
                    populate: {
                        path: 'serviceId',
                        model: 'ParaclinicalService'
                    }
                });
            res.status(200).json(medicalProcesses);
        } catch (error) {
            console.error("Error fetching medical processes:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async createMedicalProcess(req, res) {
        const { patientId, doctorId, processSteps } = req.body;
        try {
            const medicalProcess = new MedicalProcess({
                patientId,
                doctorId,
                processSteps
            });
            await medicalProcess.save();
            res.status(201).json(medicalProcess);
        } catch (error) {
            console.error("Error creating medical process:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async updateMedicalProcess(req, res) {
        const { processId } = req.params;
        const { status, currentStep } = req.body;
        try {
            const medicalProcess = await MedicalProcess.findByIdAndUpdate(
                processId,
                { status, currentStep },
                { new: true }
            );
            if (!medicalProcess) {
                return res.status(404).json({ message: "Medical process not found" });
            }
            res.status(200).json(medicalProcess);
        } catch (error) {
            console.error("Error updating medical process:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }


}
module.exports = new medicalProcessController();