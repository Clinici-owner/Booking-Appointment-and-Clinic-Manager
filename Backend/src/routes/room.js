const RoomController = require("../app/controllers/roomController");
const express = require("express");
const router = express.Router();

//get all rooms
router.get("/", RoomController.getAllRooms);
//get unused rooms
router.get("/unused", RoomController.getUnusedRooms);

module.exports = router;
