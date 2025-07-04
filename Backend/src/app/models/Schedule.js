const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Schedule = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    specialties: { type: Schema.Types.ObjectId, ref: 'Specialty', required: false },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', Schedule);