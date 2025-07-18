const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MedicalHistory = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    processStep: { type: Schema.Types.ObjectId, ref: 'ProcessStep' },
    resultFiles: [{ type: Schema.Types.ObjectId, ref: 'DocumentUpload' }],
}, { timestamps: true });

module.exports = mongoose.model('MedicalHistory', MedicalHistory);