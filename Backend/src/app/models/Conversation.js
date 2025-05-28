const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Conversation = new Schema({
    paticipants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
}, { timestamps: true });

module.exports = mongoose.model('Conversation', Conversation);