const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Specialty = new Schema({
    specialtyName: { type: String, required: true },
    descspeciality: { type: String, default: '' },
    medicalFee: { type: Number, required: true },
    documentId: [{ type: Schema.Types.ObjectId, ref: 'DocumentUpload', required: true }],
    logo: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Specialty', Specialty);