const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicalHistory = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    initialDiagnosis: { type: String, required: true },
    status: { type: String, enum: ['waiting', 'examining', 'complete'], default: 'waiting' },
    service: [{ type: Schema.Types.ObjectId, ref: 'ParaclinicalService', required: true }],
    diagnosis: { type: String, default: '' },
    resultParaclinical: [{ type: Schema.Types.ObjectId, ref: 'ResultParaclinical' }],
}, { timestamps: true });

module.exports = mongoose.model('MedicalHistory', MedicalHistory);