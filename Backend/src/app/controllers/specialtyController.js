const Specialty = require('../models/Specialty');
const DocumentUpload = require('../models/documentUpload');


class SpecialtyController {
    async createSpecialty(req, res) {
        try {
            const { dataSpecialty } = req.body;

            const { specialtyName, descspecialty, medicalFee, documentId, room, masterRoom, chiefPhysician, logo } = dataSpecialty;

            if (!specialtyName) {
                return res.status(400).json({ error: 'Tên chuyên khoa là bắt buộc.' });
            }

            const existingSpecialty = await Specialty.findOne({ specialtyName });
            if (existingSpecialty) {
                return res.status(409).json({ error: 'Chuyên khoa đã tồn tại.' });
            }

            const specialty = new Specialty({ specialtyName, descspecialty, medicalFee, documentId, room, masterRoom, chiefPhysician, logo });
            await specialty.save();
            res.status(201).json({ message: 'Chuyên khoa đã được tạo thành công.', specialty });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAllSpecialties(req, res) {
        try {
            const specialties = await Specialty.find({}).populate('documentId room masterRoom chiefPhysician');
            res.status(200).json(specialties);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chuyên khoa:", error);
            res.status(500).json({ error: 'Lỗi khi lấy danh sách chuyên khoa.' });
        }
    }

    async getSpecialtyById(req, res) {
        try {
            const { id } = req.params;
            const specialty = await Specialty.findById(id).populate('documentId room masterRoom chiefPhysician');
            if (!specialty) {
                return res.status(404).json({ error: 'Chuyên khoa không tồn tại.' });
            }
            res.status(200).json(specialty);
        } catch (error) {
            console.error("Lỗi khi lấy chuyên khoa:", error);
            res.status(500).json({ error: 'Lỗi khi lấy chuyên khoa.' });
        }
    }

    async lockSpecialty(req, res) {
        try {
            const { id } = req.params;
            const {status} = req.body;
            if (status !== true && status !== false) {
                return res.status(400).json({ error: 'Trạng thái không hợp lệ. Chỉ có thể là true hoặc false.' });
            }
            const specialty = await Specialty.findById(id);
            if (!specialty) {
                return res.status(404).json({ error: 'Chuyên khoa không tồn tại.' });
            }
            specialty.status = status;
            await specialty.save();
            res.status(200).json({ message: 'Trạng thái chuyên khoa đã được cập nhật.', specialty });
        } catch (error) {
            console.error("Lỗi khi khóa chuyên khoa:", error);
            res.status(500).json({ error: 'Lỗi khi khóa chuyên khoa.' });
        }
    }

    async updateSpecialty(req, res) {
        try {
            const { id } = req.params;
            const { dataSpecialty } = req.body;
            const { specialtyName, descspecialty, medicalFee, documentId, room, masterRoom, chiefPhysician, logo } = dataSpecialty;

            const specialty = await Specialty.findById(id);
            if (!specialty) {
                return res.status(404).json({ error: 'Chuyên khoa không tồn tại.' });
            }

            specialty.specialtyName = specialtyName || specialty.specialtyName;
            specialty.descspecialty = descspecialty || specialty.descspecialty;
            specialty.medicalFee = medicalFee || specialty.medicalFee;
            specialty.documentId = documentId || specialty.documentId;
            specialty.room = room || specialty.room;
            specialty.masterRoom = masterRoom || specialty.masterRoom;
            specialty.chiefPhysician = chiefPhysician || specialty.chiefPhysician;
            specialty.logo = logo || specialty.logo;

            await specialty.save();
            res.status(200).json({ message: 'Chuyên khoa đã được cập nhật thành công.', specialty });

        } catch (error) {
            console.error("Lỗi khi cập nhật chuyên khoa:", error);
            res.status(500).json({ error: 'Lỗi khi cập nhật chuyên khoa.' });
        }
    }
}

module.exports = new SpecialtyController();
