const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Schedule = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    roomNumber: { type: String, required: true },
    paraclinicalId: { type: Schema.Types.ObjectId, ref: 'ParaclinicalService', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', Schedule);