const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = new Schema({
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'failed', 'paid'], default: 'pending' },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['banking', 'cash'], required: true },
    medicalHistory: { type: Schema.Types.ObjectId, ref: 'MedicalHistory', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Payment', Payment);