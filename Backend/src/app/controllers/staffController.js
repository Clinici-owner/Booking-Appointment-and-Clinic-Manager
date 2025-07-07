const User = require('../models/User');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');


const DEFAULT_AVATAR_URL = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

class StaffController {

    async createStaff(req, res) {
        try {
            const { cidNumber, password, fullName, dob, role, phone, email, gender, address } = req.body;
            
            let { avatar } = req.body; 

            if (!cidNumber || !password || !email || !role) {
                return res.status(400).json({ error: 'Thiếu thông tin bắt buộc.' });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ error: 'Email đã được sử dụng.' });
            }

            if (cidNumber) {
                const existingCid = await User.findOne({ cidNumber: cidNumber.trim() });
                if (existingCid) {
                    return res.status(409).json({ error: 'CMND/CCCD đã tồn tại.' });
                }
            }

            if (phone) {
                const existingPhone = await User.findOne({ phone: phone.trim() });
                if (existingPhone) {
                    return res.status(409).json({ error: 'Số điện thoại đã tồn tại.' });
                }
            }

            if (!avatar || avatar === '/img/dafaultAvatar.jpg') {
                avatar = DEFAULT_AVATAR_URL;
            }

            
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User({ 
                cidNumber, 
                password: hashedPassword, 
                fullName, 
                dob, 
                role, 
                phone, 
                email, 
                gender, 
                address, 
                avatar 
            });
            await user.save();
            res.status(201).json({ message: 'Nhân viên đã được tạo thành công.', user });

        } catch (error) { 
            res.status(500).json({ error: error.message });
        }
    }

  async importExcel(req, res) {
    try {
        if (!req.file) {
            console.error("Không có file được gửi lên.");
            return res.status(400).json({ error: 'Không có tệp Excel được tải lên.' });
        }

        const buffer = req.file.buffer;
        const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(sheet, {
            defval: '',
            raw: false,
            dateNF: 'yyyy-mm-dd',
        });

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10,11}$/;
        const cidRegex = /^\d{9,12}$/;
        const validRoles = ['receptionist', 'doctor', 'technician', 'lễ tân', 'bác sĩ', 'kỹ thuật viên'];
        const invalidRows = [];

        const data = rawData.map(async (row, index) => {
            
            let avatarUrl = row.avatar || '';
            if (!avatarUrl || avatarUrl === '/img/dafaultAvatar.jpg') {
                avatarUrl = DEFAULT_AVATAR_URL;
            }

            
            let role = (row.role || 'receptionist').toLowerCase();
            if (role === 'lễ tân') role = 'receptionist';
            else if (role === 'bác sĩ') role = 'doctor';
            else if (role === 'kỹ thuật viên') role = 'technician';
            else if (!['receptionist', 'doctor', 'technician'].includes(role)) {
                invalidRows.push({ row: index + 2, error: `Vai trò '${role}' không hợp lệ` });
                return null;
            }

            let gender = false;
            if (row.gender) {
                const genderValue = row.gender.toString().toLowerCase();
                if (['nam', 'true', '1'].includes(genderValue)) gender = true;
                else if (['nữ', 'false', '0'].includes(genderValue)) gender = false;
                else {
                    invalidRows.push({ row: index + 2, error: `Giới tính '${genderValue}' không hợp lệ` });
                    return null;
                }
            }

            const email = row.email || '';
            const cidNumber = row.cidNumber || '';
            const phone = row.phone || '';
            const password = row.password || '';
            const errors = [];

            if (!email) errors.push('Email không được để trống');
            else if (!emailRegex.test(email)) errors.push('Email không hợp lệ');
            if (!cidNumber) errors.push('CMND/CCCD không được để trống');
            else if (!cidRegex.test(cidNumber)) errors.push('CMND/CCCD không hợp lệ (9-12 số)');
            if (phone && !phoneRegex.test(phone)) errors.push('Số điện thoại không hợp lệ (10-11 số)');
            if (!password) errors.push('Mật khẩu không được để trống');
            else if (password.length < 6) errors.push('Mật khẩu phải có ít nhất 6 ký tự');

            if (errors.length > 0) {
                invalidRows.push({ row: index + 2, errors });
                return null;
            }

            
            const hashedPassword = await bcrypt.hash(password, 10);

            return {
                cidNumber: cidNumber.trim(),
                password: hashedPassword,
                fullName: row.fullName || '',
                dob: row.dob || '',
                role,
                phone: phone || '',
                email: email.toLowerCase(),
                gender,
                address: row.address || '',
                specificAddress: row.specificAddress || '',
                avatar: avatarUrl
            };
        });

       
        const processedData = await Promise.all(data);

        console.log("Dữ liệu sau xử lý:", processedData);

        if (invalidRows.length > 0) {
            return res.status(400).json({
                error: 'Tệp Excel chứa dữ liệu không hợp lệ.',
                invalidRows
            });
        }

        if (!Array.isArray(processedData) || processedData.length === 0) {
            return res.status(400).json({ error: 'Tệp Excel không hợp lệ hoặc trống.' });
        }

        const emails = processedData.map(item => item?.email).filter(Boolean);
        const phones = processedData.map(item => item?.phone).filter(Boolean);
        const cidNumbers = processedData.map(item => item?.cidNumber).filter(Boolean);

        const [existingEmails, existingPhones, existingCids] = await Promise.all([
            User.find({ email: { $in: emails } }).select('email'),
            User.find({ phone: { $in: phones } }).select('phone'),
            User.find({ cidNumber: { $in: cidNumbers } }).select('cidNumber')
        ]);

        const duplicates = [];
        processedData.forEach((item, index) => {
            if (!item) return;
            const errors = [];
            if (existingEmails.some(e => e.email === item.email)) {
                errors.push(`Email '${item.email}' đã tồn tại`);
            }
            if (existingPhones.some(p => p.phone === item.phone)) {
                errors.push(`Số điện thoại '${item.phone}' đã tồn tại`);
            }
            if (existingCids.some(c => c.cidNumber === item.cidNumber)) {
                errors.push(`CMND/CCCD '${item.cidNumber}' đã tồn tại`);
            }
            if (errors.length > 0) {
                duplicates.push({ row: index + 2, errors });
            }
        });

        if (duplicates.length > 0) {
            return res.status(409).json({
                error: 'Dữ liệu Excel chứa các mục trùng lặp.',
                duplicates
            });
        }

        
        const validData = processedData.filter(item => item !== null);
        const inserted = await User.insertMany(validData, { ordered: false });
        res.status(201).json({ message: 'Nhân viên đã được nhập thành công.', users: inserted });
    } catch (error) {
        console.error('Lỗi khi xử lý Excel:', error);
        if (error.code === 11000) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('email')) {
                return res.status(409).json({ error: 'Dữ liệu Excel chứa email đã tồn tại.' });
            } else if (errorMessage.includes('phone')) {
                return res.status(409).json({ error: 'Dữ liệu Excel chứa số điện thoại đã tồn tại.' });
            } else if (errorMessage.includes('cidnumber') || errorMessage.includes('cccd')) {
                return res.status(409).json({ error: 'Dữ liệu Excel chứa CMND/CCCD đã tồn tại.' });
            } else {
                return res.status(409).json({ error: 'Dữ liệu Excel chứa các mục trùng lặp.' });
            }
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: `Lỗi validation: ${error.message}` });
        }
        res.status(500).json({ error: error.message || 'Lỗi khi nhập dữ liệu từ Excel.' });
    }
}


    async lockUser(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'locked'].includes(status)) {
                return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
            }

            const user = await User.findByIdAndUpdate(id, { status }, { new: true });
            if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

            res.json({ message: `Đã cập nhật trạng thái thành: ${status}`, user });
        } catch (error) { // Đổi err thành error
            res.status(500).json({ error: error.message });
        }
    }


    async listStaff(req, res) {
    try {
        const staff = await User.find({ role: { $nin: ['patient', 'admin'] } });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

    async updateStaff(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log(`Updating user ID: ${id}, Update data: ${JSON.stringify(updateData)}`);

        if (updateData.email) {
            const normalizedEmail = updateData.email.toLowerCase();
            const existingEmail = await User.findOne({ 
                email: normalizedEmail,
                _id: { $ne: id }
            });
            console.log(`Email check for ${normalizedEmail}: ${existingEmail ? 'Found' : 'Not found'}`);
            if (existingEmail) {
                return res.status(409).json({ error: 'Email đã tồn tại' });
            }
        }

        if (updateData.phone) {
            const existingPhone = await User.findOne({ 
                phone: updateData.phone.trim(),
                _id: { $ne: id }
            });
            console.log(`Phone check for ${updateData.phone}: ${existingPhone ? 'Found' : 'Not found'}`);
            if (existingPhone) {
                return res.status(409).json({ error: 'Số điện thoại đã tồn tại' });
            }
        }

        if (updateData.cidNumber) {
            const existingCid = await User.findOne({ 
                cidNumber: updateData.cidNumber.trim(),
                _id: { $ne: id }
            });
            console.log(`CID check for ${updateData.cidNumber}: ${existingCid ? 'Found' : 'Not found'}`);
            if (existingCid) {
                return res.status(409).json({ error: 'CMND/CCCD đã tồn tại' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        res.json({ message: 'Cập nhật thành công', user: updatedUser });
    } catch (error) {
        console.error(`Error updating staff: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}

    async getStaffById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user || user.role === 'patient') return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
            res.json(user);
        } catch (error) { 
            res.status(500).json({ error: error.message });
        }
    }

    // Lấy bác sĩ theo chuyên khoa
    async getDoctorsBySpecialty(req, res) {
        try {
            const { specialtyId } = req.params;
            const doctors = await User.find({ role: 'doctor', specialties: specialtyId });
            res.json(doctors);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = new StaffController();