const mongoose = require('mongoose');
const MedicalHistory = require('./MedicalHistory');
const Schema = mongoose.Schema;

const ResultParaclinical = new Schema({
    fileResult: { type: String, required: true }, // URL or path to the result file
}, { timestamps: true });

module.exports = mongoose.model('ResultParaclinical', ResultParaclinical);