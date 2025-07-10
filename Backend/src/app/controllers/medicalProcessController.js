const MedicalProcess = require("../models/MedicalProcess");
const ProcessStep = require("../models/ProcessStep");
const Room = require("../models/Room");
const ParaclinicalService = require("../models/ParaclinicalService");

class medicalProcessController {
  async createProcessStep(req, res) {
    const { serviceId, notes, patientId } = req.body;
    try {
      const processStep = new ProcessStep({
        serviceId,
        notes,
      });
      await processStep.save();

      // Update the patient's queue in the room associated with the service
      const service = await ParaclinicalService.findById(serviceId).populate(
        "room"
      );
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

  async getAllMedicalProcesses(req, res) {
    try {
      const medicalProcesses = await MedicalProcess.find()
        .populate("patientId")
        .populate("doctorId")
        .populate({
          path: "processSteps",
          populate: {
            path: "serviceId",
            model: "ParaclinicalService",
          },
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
        processSteps,
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

  getMedicalProcessById = async (req, res) => {
    const { processId } = req.params;
    try {
      const medicalProcess = await MedicalProcess.findById(processId)
        .populate("patientId")
        .populate("doctorId")
        .populate({
          path: "processSteps",
          populate: {
            path: "serviceId",
            populate: {
              path: "room",
            },
          },
        });
      if (!medicalProcess) {
        return res.status(404).json({ message: "Medical process not found" });
      }
      res.status(200).json(medicalProcess);
    } catch (error) {
      console.error("Error fetching medical process:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  async completeCurrentStep(req, res) {
    const { userId } = req.params;

    try {
      const medicalProcess = await MedicalProcess.findOne({
        patientId: userId,
        status: "in_progress",
      }).populate({
        path: "processSteps",
        populate: {
          path: "serviceId",
          populate: { path: "room" },
        },
      });

      if (!medicalProcess) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy quy trình đang hoạt động." });
      }

      const currentStepIndex = medicalProcess.currentStep - 1;

      if (currentStepIndex >= medicalProcess.processSteps.length) {
        return res
          .status(400)
          .json({ message: "Bước hiện tại vượt quá số bước." });
      }

      const currentStep = medicalProcess.processSteps[currentStepIndex];

      await ProcessStep.findByIdAndUpdate(currentStep._id, {
        isCompleted: true,
      });

      const currentRoom = currentStep.serviceId?.room;
      if (currentRoom) {
        await Room.findByIdAndUpdate(currentRoom._id, {
          $pull: { patientQueue: userId },
        });
      }

      const isLastStep =
        medicalProcess.currentStep === medicalProcess.processSteps.length;
      if (isLastStep) {
        medicalProcess.status = "completed";
      } else {
        medicalProcess.currentStep += 1;

        const nextStep = medicalProcess.processSteps[currentStepIndex + 1];
        const nextRoom = nextStep.serviceId?.room;
        if (nextRoom) {
          await Room.findByIdAndUpdate(nextRoom._id, {
            $addToSet: { patientQueue: userId }, 
          });
        }
      }

      await medicalProcess.save();

      return res
        .status(200)
        .json({ message: "Cập nhật bước khám thành công." });
    } catch (error) {
      console.error("Lỗi khi hoàn thành bước khám:", error);
      return res.status(500).json({ message: "Lỗi máy chủ." });
    }
  };

  async getPatientMedicalProcess(req, res) {
  const { userId } = req.params; 

  try {
    const medicalProcess = await MedicalProcess.findOne({
      patientId: userId,
    })
      .sort({ createdAt: -1 })
      .populate("doctorId", "fullName email avatar") 
      .populate({
        path: "processSteps",
        populate: {
          path: "serviceId",
          populate: { path: "room" },
        },
      });

    if (!medicalProcess) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tiến trình khám bệnh." });
    }

    const processInfo = {
      processId: medicalProcess._id,
      doctor: {
        fullName: medicalProcess.doctorId.fullName,
        email: medicalProcess.doctorId.email,
        avatar: medicalProcess.doctorId.avatar,
      },
      status: medicalProcess.status,
      currentStep: medicalProcess.currentStep,
      totalSteps: medicalProcess.processSteps.length,
      steps: medicalProcess.processSteps.map((step, index) => ({
        stepNumber: index + 1,
        isCompleted: step.isCompleted,
        serviceName: step.serviceId?.paraclinalName || "Không xác định",
        roomId: step.serviceId?.room?._id,
        roomNumber: step.serviceId?.room?.roomNumber,
        roomName: step.serviceId?.room?.roomName || "Chưa phân phòng",
        notes: step.notes,
        createdAt: step.createdAt,
      })),
      startedAt: medicalProcess.createdAt,
      updatedAt: medicalProcess.updatedAt,
    };

    return res.status(200).json(processInfo);
  } catch (error) {
    console.error("Lỗi khi lấy tiến trình của bệnh nhân:", error);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

}

module.exports = new medicalProcessController();
