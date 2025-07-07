const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParaclinicalService = new Schema({
    paraclinalName: { type: String, required: true },
    paraPrice: { type: Number, required: true },
    specialty: { type: Schema.Types.ObjectId, ref: 'Specialty', required: false },
    room: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    status:{type: String, enum:['available', 'disable'], default:'available' }
}, { timestamps: true });

module.exports = mongoose.model('ParaclinicalService', ParaclinicalService);