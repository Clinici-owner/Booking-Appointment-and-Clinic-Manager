const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParaclinicalService = new Schema({
    paraclinalName: { type: String, required: true },
    paraPrice: { type: Number, required: true },
    roomNumber: { type: String, required: true },
    status:{type: String, enum:['available', 'disable'], default:'available' }
}, { timestamps: true });

module.exports = mongoose.model('ParaclinicalService', ParaclinicalService);