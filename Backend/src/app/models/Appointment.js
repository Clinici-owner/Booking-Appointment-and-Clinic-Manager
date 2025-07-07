const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Appointment = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null },
    time: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },

    specialties: [{ type: Schema.Types.ObjectId, ref: 'Specialty', required: false, default: null }],
    healthPackage: { type: Schema.Types.ObjectId, ref: 'HealthPackage', required: false, default: null },
    symptoms: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', Appointment);