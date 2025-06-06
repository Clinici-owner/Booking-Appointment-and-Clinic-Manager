const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = new Schema({
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    star: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', Review);