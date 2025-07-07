const RoomController = require("../app/controllers/roomController");
const express = require("express");
const router = express.Router();

//get all rooms
router.get("/", RoomController.getAllRooms);
//get unused rooms
router.get("/unused", RoomController.getUnusedRooms);
//toggle room status
router.put("/:roomId/toggle-status", RoomController.toggleRoomStatus);

module.exports = router;
