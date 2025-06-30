const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicalProcess = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
    processSteps: [{ type: Schema.Types.ObjectId, ref: 'ProcessStep' }],
    currentStep: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('MedicalProcess', MedicalProcess);