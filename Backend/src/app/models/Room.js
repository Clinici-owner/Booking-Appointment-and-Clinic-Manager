const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Room = new Schema({
    roomNumber: { type: String, required: true },
    roomName: { type: String, required: true},
}, { timestamps: true });

module.exports = mongoose.model('Room', Room);