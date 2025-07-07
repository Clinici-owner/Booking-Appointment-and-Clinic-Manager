const Service = require("../models/ParaclinicalService");

const Room = require("../models/Room");


class serviceController {
  async createService(req, res, next) {
    try {
      const { name, price, room, specialty } = req.body;

      // Kiểm tra các trường bắt buộc
      if (!name || !price || !room) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      }

      // Kiểm tra phòng có tồn tại không
      const existingRoom = await Room.findById(room); 
      if (!existingRoom) {
        return res.status(400).json({ message: "Phòng không tồn tại" });
      }

      // Kiểm tra nếu phòng đã được sử dụng cho một dịch vụ khác
      const existingService = await Service.findOne({ room: room });
      if (existingService) {
        return res.status(400).json({ message: "Phòng này đã được sử dụng cho một dịch vụ khác" });
      }

      // Kiểm tra giá trị của price
      if (price <= 0) {
        return res.status(400).json({ message: "Giá phải lớn hơn 0!" });
      }

      // Tạo dịch vụ mới
      const service = new Service({
        paraclinalName: name,
        paraPrice: price,
        room: room,
        specialty: specialty || null,  // Nếu không có specialty thì để null
      });

      await service.save();  // Lưu dịch vụ vào cơ sở dữ liệu

      // Cập nhật trạng thái phòng thành 'used' sau khi tạo dịch vụ
      existingRoom.status = 'used';  
      await existingRoom.save();  // Lưu lại trạng thái phòng

      return res.status(201).json({
        message: "Tạo dịch vụ thành công và phòng đã được đánh dấu là 'used'",
        service,
      });
    } catch (error) {
      console.error("Lỗi trong tạo dịch vụ:", error);  // Log chi tiết lỗi
      next(error);  // Chuyển lỗi tới middleware xử lý lỗi
    }
  }


  // Hoang Anh dang dung
  async listService(req, res) {
    try {
      const servicelist = await Service.find()
        .populate("room")


      return res.status(200).json({
        message: "Lấy danh sách dịch vụ thành công",
        services: servicelist,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Lỗi hệ thống" });
    }
  }

  // Lấy chi tiết dịch vụ
  async detailService(req, res) {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        return res.status(400).json({ error: "Chưa có serviceId" });
      }

      const service = await Service.findById(serviceId).populate('room'); // Lấy thông tin phòng

      if (!service) {
        return res.status(404).json({ error: "Không tìm thấy dịch vụ" });
      }

      return res.json({ service: service });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Lỗi hệ thống" });
    }
  }

  // Cập nhật dịch vụ
  async editService(req, res, next) {
    try {
      const { name, price, room, status } = req.body;
      const { serviceId } = req.params;

      if (!serviceId || !name || !price || !room || !status) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      }

      if (!["available", "disable"].includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      const existingRoom = await Room.findById(room); // Kiểm tra phòng tồn tại
      if (!existingRoom) {
        return res.status(400).json({ message: "Phòng không tồn tại" });
      }

      const duplicateRoom = await Service.findOne({
        room: room,
        _id: { $ne: serviceId },
      });
      if (duplicateRoom) {
        return res.status(400).json({ message: "Phòng này đã được sử dụng cho một dịch vụ khác" });
      }

      if (price <= 0) {
        return res.status(400).json({ message: "Giá phải lớn hơn 0!" });
      }

      const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        {
          paraclinalName: name,
          paraPrice: price,
          room: room,
          status,
        },
        { new: true }
      );

      if (!updatedService) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
      }

      return res.status(200).json({
        message: "Cập nhật dịch vụ thành công",
        service: updatedService,
      });
    } catch (error) {
      next(error);
    }
  }

  // Thay đổi trạng thái dịch vụ
  async changeStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!["available", "disable"].includes(status)) {
      return res.status(400).json({ message: "Giá trị status không hợp lệ." });
    }

    try {
      const updatedService = await Service.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedService) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
      }

      return res.status(200).json({
        message: "Cập nhật trạng thái thành công.",
        service: updatedService,
      });
    } catch (err) {
      return res.status(500).json({ message: "Lỗi hệ thống.", error: err.message });
    }
  }

  // Tìm kiếm dịch vụ theo tên
  async searchServiceByName(req, res) {
    try {
      const { name } = req.query;

      const query = name
        ? { paraclinalName: { $regex: name, $options: "i" } }
        : {};

      const services = await Service.find(query).populate('room'); // Lấy thông tin phòng

      return res.status(200).json({
        message: "Tìm kiếm thành công",
        services,
      });
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  }
}


module.exports = new serviceController();
