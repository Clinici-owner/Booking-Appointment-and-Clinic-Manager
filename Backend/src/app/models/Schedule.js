const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Schedule = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    specialties: { type: Schema.Types.ObjectId, ref: 'Specialty', required: false },
    shift: { type: String, enum: ['MORNING', 'AFTERNOON', 'EVENING'], required: true },
    date: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', Schedule);