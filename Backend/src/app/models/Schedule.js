const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Schedule = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shift: { type: Date, required: true },
    date: { type: Date, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', Schedule);