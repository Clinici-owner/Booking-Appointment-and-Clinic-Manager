const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProcessStep = new Schema({
    serviceId: { type: Schema.Types.ObjectId, ref: 'ParaclinicalService', required: true },
    isCompleted: { type: Boolean, default: false },
    notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ProcessStep', ProcessStep);