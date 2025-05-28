const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    cidNumber: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, default: 'Người dùng mới' },
    dob: { type: Date },
    role: { type: String, enum: ['patient', 'doctor', 'admin', 'technician', 'receptionist'], default: 'patient' },
    avatar: { type: String, default: '/img/dafaultAvatar.jpg' },
    address: { type: String, default: '' },
    phone: { type: String },
    email: { type: String, required: true },
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
    gender: {type: Boolean, default: true},
    otp: { type: String },
    otpExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', User);