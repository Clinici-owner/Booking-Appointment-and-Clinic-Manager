const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema({
   conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
   senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
   message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', Message);