const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentUpload = new Schema({
    file_path: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('DocumentUpload', DocumentUpload);