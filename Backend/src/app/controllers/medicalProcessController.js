const MedicalProcess = require('../models/MedicalProcess');
const ProcessStep = require('../models/ProcessStep');
const Room = require('../models/Room');
const ParaclinicalService = require('../models/ParaclinicalService');

class medicalProcessController {

    async createProcessStep(req, res) {
        const { serviceId, notes, patientId } = req.body;
        try {
            const processStep = new ProcessStep({
                serviceId,
                notes
            });
            await processStep.save();
    
            // Update the patient's queue in the room associated with the service
            const service = await ParaclinicalService.findById(serviceId).populate('room');
            if (service && service.room) {
                await Room.updateOne(
                    { _id: service.room._id },
                    { $push: { patientQueue: patientId } }
                );
            }

            res.status(201).json(processStep);
        } catch (error) {
            console.error("Error creating process step:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async updateProcessStep(req, res) {
        const { stepId } = req.params;
        const { isCompleted } = req.body;
        try {
            const processStep = await ProcessStep.findByIdAndUpdate(
                stepId,
                { isCompleted },
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

    async updateMedicalProcessStatus(req, res) {
        const { processId } = req.params;
        const { status } = req.body;
        try {
            const medicalProcess = await MedicalProcess.findByIdAndUpdate(
                processId,
                { status },
                { new: true }
            );
            if (!medicalProcess) {
                return res.status(404).json({ message: "Medical process not found" });
            }
            res.status(200).json(medicalProcess);
        } catch (error) {
            console.error("Error updating medical process status:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    updateMedicalProcessCurrentStep = async (req, res) => {
        const { processId } = req.params;
        const { currentStep } = req.body;
        try {
            const medicalProcess = await MedicalProcess.findByIdAndUpdate(
                processId,
                { currentStep },
                { new: true }
            );
            if (!medicalProcess) {
                return res.status(404).json({ message: "Medical process not found" });
            }
            res.status(200).json(medicalProcess);
        } catch (error) {
            console.error("Error updating medical process current step:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    getMedicalProcessById = async (req, res) => {
        const { processId } = req.params;
        try {
            const medicalProcess = await MedicalProcess.findById(processId)
                .populate('patientId')
                .populate('doctorId')
                .populate({
                    path: 'processSteps',
                    populate: {
                        path: 'serviceId',
                        populate: {
                            path: 'room',
                        }
                    }
                });
            if (!medicalProcess) {
                return res.status(404).json({ message: "Medical process not found" });
            }
            res.status(200).json(medicalProcess);
        } catch (error) {
            console.error("Error fetching medical process:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = new medicalProcessController();