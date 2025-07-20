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

      if (targetSocketId) {
        
        io.to(targetSocketId).emit("invited_to_room", {
          message: "Bạn được mời vào phòng khám.",
          timestamp: new Date(),
        });
        console.log(`Mời bệnh nhân userId: ${userId} với socketId: ${targetSocketId}`);

       
        try {
          const res = await axios.post("http://localhost:3000/api/notifications", {
            userId,
            title: "Mời vào phòng khám",
            message: "Bạn đã được mời vào phòng, vui lòng đến gặp bác sĩ.",
          });

          console.log("Gửi và lưu thông báo thành công:", res.data);
        } catch (err) {
          console.error("Lỗi khi gửi API lưu thông báo:", err.message);
          if (err.response?.data) {
            console.error("Response data:", err.response.data);
          }
        }
      } else {
        console.warn(`Không tìm thấy socket cho userId: ${userId}`);
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
