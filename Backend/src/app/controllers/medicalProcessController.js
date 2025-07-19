const MedicalProcess = require("../models/MedicalProcess");
const ProcessStep = require("../models/ProcessStep");
const Room = require("../models/Room");
const ParaclinicalService = require("../models/ParaclinicalService");

class medicalProcessController {
  async getTodayProcessStepsByRoom(req, res) {
    const { roomId } = req.params;

    try {
      // Lấy ngày bắt đầu và kết thúc của hôm nay
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Tìm các ProcessStep có serviceId liên quan đến roomId
      // Giả sử ProcessStep có trường serviceId tham chiếu ParaclinicalService, và ParaclinicalService có trường room
      // Cần populate để lọc theo roomId
      const steps = await ProcessStep.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).populate({
        path: "serviceId",
        populate: { path: "room" },
      });

      // Lọc các step có serviceId.room._id === roomId
      const filteredSteps = steps.filter(
        (step) =>
          step.serviceId &&
          step.serviceId.room &&
          String(step.serviceId.room._id) === String(roomId)
      );

      // Lấy danh sách bệnh nhân liên quan đến các bước quy trình này
      // Giả sử mỗi step có trường patient hoặc serviceId có patient, nếu không thì cần truy vấn MedicalProcess
      // Ở đây sẽ truy vấn MedicalProcess để lấy patient cho từng step
      const stepIds = filteredSteps.map((step) => step._id);
      const medicalProcesses = await MedicalProcess.find({
        processSteps: { $in: stepIds },
      }).populate({ path: "appointmentId", populate: { path: "patientId" } });

      // Map stepId -> patient (lấy từ appointmentId.patientId)
      const stepIdToPatient = {};
      medicalProcesses.forEach((mp) => {
        mp.processSteps.forEach((psId) => {
          if (stepIds.find((id) => String(id) === String(psId))) {
            stepIdToPatient[String(psId)] = mp.appointmentId?.patientId || null;
          }
        });
      });

      // Gắn patient vào từng step
      const stepsWithPatient = filteredSteps.map((step) => ({
        ...step.toObject(),
        patient: stepIdToPatient[String(step._id)] || null,
      }));

      return res.status(200).json(stepsWithPatient);
    } catch (error) {
      console.error("Lỗi khi lấy các bước quy trình theo roomId:", error);
      return res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  async createProcessStep(req, res) {
    const { serviceId, notes, patientId, isFirstStep } = req.body;
    try {
      const processStep = new ProcessStep({
        serviceId,
        notes,
      });
      await processStep.save();

      // Chỉ thêm vào hàng đợi nếu là bước đầu tiên
      if (isFirstStep) {
        const service = await ParaclinicalService.findById(serviceId).populate(
          "room"
        );
        if (service && service.room) {
          await Room.updateOne(
            { _id: service.room._id },
            { $push: { patientQueue: patientId } }
          );
        }
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
        .populate({ path: "appointmentId", populate: { path: "patientId" } })
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
    const { appointmentId, doctorId, processSteps, currentStep, finalResult, status } = req.body;
    try {
      const medicalProcess = new MedicalProcess({
        appointmentId,
        doctorId,
        processSteps,
        currentStep,
        finalResult,
        status
      });
      await medicalProcess.save();
      // Populate appointmentId -> patientId, doctorId, and processSteps for response
      const populatedProcess = await MedicalProcess.findById(medicalProcess._id)
        .populate({
          path: 'appointmentId',
          populate: { path: 'patientId', select: 'fullName email phoneNumber' }
        })
        .populate('doctorId', 'fullName email phoneNumber')
        .populate('processSteps');
      res.status(201).json(populatedProcess);
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
        .populate({ path: "appointmentId", populate: { path: "patientId" } })
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
      // Tìm appointmentId mới nhất của bệnh nhân
      const Appointment = require("../models/Appointment");
      const latestAppointment = await Appointment.findOne({ patientId: userId })
        .sort({ createdAt: -1 });
      if (!latestAppointment) {
        return res.status(404).json({ message: "Không tìm thấy lịch hẹn cho bệnh nhân." });
      }
      const appointmentId = latestAppointment._id;
      // Tìm MedicalProcess theo appointmentId
      const medicalProcess = await MedicalProcess.findOne({
        appointmentId,
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
    // Tìm appointmentId mới nhất của bệnh nhân
    const Appointment = require("../models/Appointment");
    const latestAppointment = await Appointment.findOne({ patientId: userId })
      .sort({ createdAt: -1 });
    if (!latestAppointment) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn cho bệnh nhân." });
    }
    const appointmentId = latestAppointment._id;
    // Tìm MedicalProcess theo appointmentId
    const medicalProcess = await MedicalProcess.findOne({
      appointmentId,
    })
      .sort({ createdAt: -1 })
      .populate("doctorId", "fullName email avatar")
      .populate({
        path: "processSteps",
        populate: {
          path: "serviceId",
          populate: { path: "room" },
        },
      })
      .populate({ path: "appointmentId", populate: { path: "patientId" } });
    if (!medicalProcess) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tiến trình khám bệnh." });
    }
    const processInfo = {
      processId: medicalProcess._id,
      appointmentId: appointmentId,
      patient: medicalProcess.appointmentId?.patientId || null,
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


  async updateProcessStepNotes(req, res) {
    const { stepId } = req.params;
    const { notes } = req.body;

    try {
      const processStep = await ProcessStep.findById(stepId);
      if (!processStep) {
        return res
          .status(404)
          .json({ message: "Bước quy trình không tồn tại." });
      }

      processStep.notes = notes;
      await processStep.save();

      return res
        .status(200)
        .json({ message: "Cập nhật ghi chú bước quy trình thành công." });
    } catch (error) {
      console.error("Lỗi khi cập nhật ghi chú bước quy trình:", error);
      return res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  async updateMedicalProcessFinalResult(req, res) {
    const { processId } = req.params;
    const { finalResult } = req.body;

    try {
      const medicalProcess = await MedicalProcess.findById(processId);
      if (!medicalProcess) {
        return res
          .status(404)
          .json({ message: "Quy trình y tế không tồn tại." });
      }

      medicalProcess.finalResult = finalResult;
      await medicalProcess.save();

      return res
        .status(200)
        .json({ message: "Cập nhật kết quả cuối cùng của quy trình y tế thành công." });
    } catch (error) {
      console.error("Lỗi khi cập nhật kết quả cuối cùng của quy trình y tế:", error);
      return res.status(500).json({ message: "Lỗi máy chủ." });
    }
  }

  // Lấy quy trình khám theo appointmentId
  async getMedicalProcessByAppointmentId(req, res) {
    const { appointmentId } = req.params;
    try {
      const medicalProcess = await MedicalProcess.findOne({ appointmentId })
        .populate({ path: "appointmentId", populate: { path: "patientId" } })
        .populate("doctorId")
        .populate({
          path: "processSteps",
          populate: {
            path: "serviceId",
            populate: { path: "room" },
          },
        });
      if (!medicalProcess) {
        return res.status(404).json({ message: "Medical process not found" });
      }
      res.status(200).json(medicalProcess);
    } catch (error) {
      console.error("Error fetching medical process by appointmentId:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new medicalProcessController();
