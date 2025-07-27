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
    console.log("Client connected:", socket.id);

    socket.on("register", (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("invite_patient", async ({ userId }) => {
      const targetSocketId = userSocketMap.get(userId);

      try {
        const res = await axios.get(`http://localhost:3000/api/medicalProcess/my-process/${userId}`);
        const process = res.data;

        let message = "Bác sĩ đã mời bạn vào phòng khám, vui lòng đến phòng khám."; // Mặc định

        if (process && process.steps && process.steps.length > 0) {
          const currentStep = process.steps.find((step) => !step.isCompleted) || process.steps[0];
          const roomNumber = currentStep?.roomNumber || "không xác định";
          const roomName = currentStep?.roomName || "";
          message = `Bạn đã được mời vào phòng ${roomNumber} ${roomName ? `(${roomName})` : ""}, vui lòng đến gặp bác sĩ.`;
        }

        if (targetSocketId) {
          io.to(targetSocketId).emit("invited_to_room", {
            message,
            timestamp: new Date(),
          });
          console.log(`Mời bệnh nhân ${userId}:`, message);
        }

        const saveRes = await axios.post("http://localhost:3000/api/notifications", {
          userId,
          title: "Mời vào phòng khám",
          message,
        });

        console.log("Lưu thông báo:", saveRes.data);
      } catch (err) {
        console.error("Lỗi khi xử lý invite_patient:", err.message);
        if (err.response?.data) {
          console.error("Response data:", err.response.data);
        }

        const fallbackMessage = "Bác sĩ đã mời bạn vào phòng khám, vui lòng đến phòng khám.";

        if (targetSocketId) {
          io.to(targetSocketId).emit("invited_to_room", {
            message: fallbackMessage,
            timestamp: new Date(),
          });
          console.log(`(Fallback) Mời bệnh nhân ${userId}:`, fallbackMessage);
        }

        try {
          const saveRes = await axios.post("http://localhost:3000/api/notifications", {
            userId,
            title: "Mời vào phòng khám",
            message: fallbackMessage,
          });

          console.log("Lưu thông báo fallback:", saveRes.data);
        } catch (saveErr) {
          console.error("Lỗi khi lưu thông báo fallback:", saveErr.message);
        }
      }
    });

    socket.on("complete_step", async ({ userId, message }) => {
      const targetSocketId = userSocketMap.get(userId);
      try {
        if (targetSocketId) {
          io.to(targetSocketId).emit("complete_step", {
            message: message || "Bạn đã hoàn tất bước này, vui lòng chờ phòng tiếp theo.",
            timestamp: new Date(),
          });
          console.log(`Gửi thông báo hoàn tất bước đến bệnh nhân ${userId}`);
        }

        await axios.post("http://localhost:3000/api/notifications", {
          userId,
          title: "Hoàn tất bước khám",
          message: message || "Bạn đã hoàn thành bước khám này, vui lòng chờ bước tiếp theo.",
        });
      } catch (error) {
        console.error("Lỗi khi xử lý complete_step:", error.message);
        if (error.response?.data) {
          console.error("Response data:", error.response.data);
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
      console.log("Disconnected socket:", socket.id);
    });
  });

  return io;
}

module.exports = setupSocket;
