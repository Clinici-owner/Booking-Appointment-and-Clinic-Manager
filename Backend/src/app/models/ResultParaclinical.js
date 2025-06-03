const mongoose = require('mongoose');
const MedicalHistory = require('./MedicalHistory');
const Schema = mongoose.Schema;

const ResultParaclinical = new Schema({
    medicalHistory: { type: Schema.Types.ObjectId, ref: 'MedicalHistory', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'ParaclinicalService', required: true },
    fileResult: { type: String, required: true }, // URL or path to the result file
}, { timestamps: true });

module.exports = mongoose.model('ResultParaclinical', ResultParaclinical);