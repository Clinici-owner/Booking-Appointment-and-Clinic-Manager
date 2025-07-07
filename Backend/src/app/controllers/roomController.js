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


  async toggleRoomStatus(req, res) {
    const { roomId } = req.params;

    try {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      room.status = room.status === "unprocessed" ? "used" : "unprocessed";
      await room.save();

      res.status(200).json({
        message: "Room status updated successfully",
        room,
      });
    } catch (error) {
      console.error("Error toggling room status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new RoomController();
