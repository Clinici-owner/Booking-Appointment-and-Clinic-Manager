const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StaffProfile = new Schema({
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    certificateId: [{ type: Schema.Types.ObjectId, ref: 'DocumentUpload', required: true }],
    description: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    specialties: [{ type: Schema.Types.ObjectId, ref: 'Specialty', required: false }],
}, { timestamps: true });

module.exports = mongoose.model('StaffProfile', StaffProfile);