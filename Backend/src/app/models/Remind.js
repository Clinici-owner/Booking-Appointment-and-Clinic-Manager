const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Remind = new Schema({
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    time: { type: Date, required: true },
    message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Remind', Remind);