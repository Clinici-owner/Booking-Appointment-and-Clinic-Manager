const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicalProcess = new Schema({
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'in_progress' },
    processSteps: [{ type: Schema.Types.ObjectId, ref: 'ProcessStep' }],
    currentStep: { type: Number, default: 1 },
    finalResult: { type: String, default: '', required: false },
}, { timestamps: true });

module.exports = mongoose.model('MedicalProcess', MedicalProcess);