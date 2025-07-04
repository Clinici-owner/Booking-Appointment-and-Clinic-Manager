const Room = require("../models/Room");

class RoomController {
  // Lấy danh sách phòng
  async getAllRooms(req, res) {
    try {
      const rooms = await Room.find();
      return res.status(200).json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Lấy danh sách phòng theo trạng thái chưa sử dụng
  async getUnusedRooms(req, res) {
    try {
      const unusedRooms = await Room.find({ status: "unprocessed" });
      return res.status(200).json(unusedRooms);
    } catch (error) {
      console.error("Error fetching unused rooms:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

}

module.exports = new RoomController();
