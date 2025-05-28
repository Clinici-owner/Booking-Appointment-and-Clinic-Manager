const mongoose = require('mongoose');
const MedicalHistory = require('./MedicalHistory');
const Schema = mongoose.Schema;

const MedicalProcess = new Schema({
    medicalHistoryId: { type: Schema.Types.ObjectId, ref: 'MedicalHistory', required: true },
    medicalCurrent: { type: Schema.Types.ObjectId, ref: 'ParaclinicalService', required: true },
}, { timestamps: true });

module.exports = mongoose.model('MedicalProcess', MedicalProcess);