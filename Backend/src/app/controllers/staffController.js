const User = require('../models/User');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');


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

            
            if (!avatar || avatar === '/img/dafaultAvatar.jpg') {
                avatar = DEFAULT_AVATAR_URL;
            }

            const user = new User({ 
                cidNumber, 
                password, 
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

            const data = rawData.map(row => {
                let avatarUrl = row.avatar;
                // Gán avatar mặc định nếu không có trong Excel hoặc là giá trị mặc định cũ
                if (!avatarUrl || avatarUrl === '/img/dafaultAvatar.jpg') {
                    avatarUrl = DEFAULT_AVATAR_URL;
                }

                return {
                    ...row,
                    gender: row.gender === 'TRUE' || row.gender === true || row.gender === 'true' ? true : false,
                    avatar: avatarUrl // Gán avatar đã được xử lý
                };
            });

            console.log("Dữ liệu sau xử lý:", data);

            if (!Array.isArray(data) || data.length === 0) {
                return res.status(400).json({ error: 'Tệp Excel không hợp lệ hoặc trống.' });
            }

            const inserted = await User.insertMany(data);
            res.status(201).json({ message: 'Nhân viên đã được nhập thành công.', users: inserted });
        } catch (error) {
            console.error('Lỗi khi xử lý Excel:', error);
            if (error.code === 11000) { 
                return res.status(409).json({ error: 'Dữ liệu Excel chứa các mục trùng lặp (ví dụ: Email đã tồn tại).' });
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
            const staff = await User.find({ role: { $ne: 'patient' } });
            res.json(staff);
        } catch (error) { // Đổi err thành error
            res.status(500).json({ error: error.message });
        }
    }

    async updateStaff(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedUser) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            res.json({ message: 'Cập nhật thành công', user: updatedUser });
        } catch (error) { // Đổi err thành error
            res.status(500).json({ error: error.message });
        }
    }

    async getStaffById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user || user.role === 'patient') return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
            res.json(user);
        } catch (error) { // Đổi err thành error
            res.status(500).json({ error: error.message });
        }
    }
}
module.exports = new StaffController();