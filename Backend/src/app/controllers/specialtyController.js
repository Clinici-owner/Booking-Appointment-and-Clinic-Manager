const Specialty = require('../models/Specialty');
const DocumentUpload = require('../models/documentUpload');


class SpecialtyController {
    async createSpecialty(req, res) {
        try {
            const { dataSpecialty } = req.body;

            const { specialtyName, descspeciality, medicalFee, documentId, logo } = dataSpecialty;

            if (!specialtyName) {
                return res.status(400).json({ error: 'Tên chuyên khoa là bắt buộc.' });
            }

            const existingSpecialty = await Specialty.findOne({ specialtyName });
            if (existingSpecialty) {
                return res.status(409).json({ error: 'Chuyên khoa đã tồn tại.' });
            }

            const specialty = new Specialty({ specialtyName, descspeciality, medicalFee, documentId, logo });
            await specialty.save();
            res.status(201).json({ message: 'Chuyên khoa đã được tạo thành công.', specialty });

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
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);

            for (const item of data) {
                if (!item.name) continue; // Bỏ qua nếu không có tên chuyên khoa
                const existingSpecialty = await Specialty.findOne({ name: item.name });
                if (!existingSpecialty) {
                    const specialty = new Specialty(item);
                    await specialty.save();
                }
            }

            res.status(200).json({ message: 'Dữ liệu đã được nhập thành công.' });

        } catch (error) {
            console.error("Lỗi khi nhập dữ liệu từ Excel:", error);
            res.status(500).json({ error: 'Lỗi khi nhập dữ liệu từ Excel.' });
        }
    }

    async exportExcel(req, res) {
        try {
            const specialties = await Specialty.find({});
            const data = specialties.map(s => ({
                name: s.name,
                description: s.description
            }));

            const worksheet = xlsx.utils.json_to_sheet(data);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Specialties');

            const filePath = path.join(__dirname, '../../uploads/specialties.xlsx');
            xlsx.writeFile(workbook, filePath);
            res.status(200).json({ message: 'Dữ liệu đã được xuất thành công.', filePath });
        } catch (error) {
            console.error("Lỗi khi xuất dữ liệu ra Excel:", error);
            res.status(500).json({ error: 'Lỗi khi xuất dữ liệu ra Excel.' });
        }
    }
}

module.exports = new SpecialtyController();
