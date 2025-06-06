const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const News = new Schema({
    newsName: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: Schema.Types.ObjectId, ref: 'DocumentUpload', required: true },
}, { timestamps: true });

module.exports = mongoose.model('News', News);