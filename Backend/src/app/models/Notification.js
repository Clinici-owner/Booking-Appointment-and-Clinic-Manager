const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Notification = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: {type: String},
    message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Notification', Notification);