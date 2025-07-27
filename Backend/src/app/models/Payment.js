const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = new Schema({
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    status: { type: String, enum: ['pending', 'failed', 'paid'], default: 'pending' },
    examinationFee: { type: Number, required: true },
    serviceFee: [{
        serviceId: { type: Schema.Types.ObjectId, ref: 'ParaclinicalService' },
        fee: { type: Number }
    }],
    methodExam: { type: String, enum: ['banking', 'cash', 'none'], default: 'none' },
    methodService: { type: String, enum: ['banking', 'cash', 'none'], default: 'none' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', Payment);
