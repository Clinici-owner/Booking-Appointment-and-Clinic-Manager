const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HealthPackage = new Schema({
    packageName: { type: String, required: true },
    packagePrice: { type: Number, required: true },
    service: [{type: Schema.Types.ObjectId, ref: 'ParaclinicalService', required: true}],
    specialties: [{ type: Schema.Types.ObjectId, ref: 'Specialty' }],
    packageImage: { type: String, default: 'imageExample.jpg' },
    status: { type: String, enum: ['active', 'nonactive'], default: 'active' },
    description: { type: String, default: '' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('HealthPackage', HealthPackage);