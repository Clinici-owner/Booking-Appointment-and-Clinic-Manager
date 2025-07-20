const { Server } = require("socket.io");
const axios = require("axios");

const userSocketMap = new Map();

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("register", (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log(`🧍 User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("invite_patient", async ({ userId }) => {
      const targetSocketId = userSocketMap.get(userId);

      try {
        // ✅ Gọi API lấy tiến trình khám của bệnh nhân
        const res = await axios.get(`http://localhost:3000/api/medicalProcess/my-process/${userId}`);
        const process = res.data;

        // ✅ Lấy số phòng từ bước đầu tiên (hoặc bước hiện tại)
        const currentStep = process.steps.find((step) => !step.isCompleted) || process.steps[0];
        const roomNumber = currentStep?.roomNumber || "không xác định";
        const roomName = currentStep?.roomName || "";

        const message = `🔔 Bạn đã được mời vào phòng ${roomNumber} ${roomName ? `(${roomName})` : ""}, vui lòng đến gặp bác sĩ.`;

        // ✅ Gửi real-time socket
        if (targetSocketId) {
          io.to(targetSocketId).emit("invited_to_room", {
            message,
            timestamp: new Date(),
          });
          console.log(`📣 Mời bệnh nhân ${userId} đến phòng ${roomNumber}`);
        } else {
          console.warn(`⚠️ Không tìm thấy socket cho userId: ${userId}`);
        }

        // ✅ Lưu thông báo
        const saveRes = await axios.post("http://localhost:3000/api/notifications", {
          userId,
          title: "Mời vào phòng khám",
          message,
        });
        console.log("✅ Lưu thông báo:", saveRes.data);

      } catch (err) {
        console.error("❌ Lỗi khi xử lý invite_patient:", err.message);
        if (err.response?.data) {
          console.error("↪️ Response data:", err.response.data);
        }
      }
    });

    socket.on("disconnect", () => {
      for (const [id, sid] of userSocketMap.entries()) {
        if (sid === socket.id) {
          userSocketMap.delete(id);
          break;
        }
      }
      console.log("❌ Disconnected socket:", socket.id);
    });
  });

  return io;
}

module.exports = setupSocket;
