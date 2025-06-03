const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HealthPackage = new Schema({
    packageName: { type: String, required: true },
    packagePrice: { type: Number, required: true },
    service: [{type: Schema.Types.ObjectId, ref: 'ParaclinicalService', required: true}],
    description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('HealthPackage', HealthPackage);