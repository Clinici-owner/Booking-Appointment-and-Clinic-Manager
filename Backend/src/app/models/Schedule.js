const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Schedule = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true }, //hiển kiêu xóa chuyên khoa
    shift: { type: String, enum: ['MORNING', 'NOON', 'AFTERNOON'], required: true },
    date: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', Schedule);