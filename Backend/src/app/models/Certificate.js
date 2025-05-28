const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Certificate = new Schema({
    userId : { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageId: { type: Schema.Types.ObjectId, ref: 'DocumentUpload', required: true },
    certificateDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', Certificate);