const Service = require("../models/ParaclinicalService");

class serviceController {
  async createService(req, res, next) {
    try {
      const { name, price, room } = req.body;

      if (!name || !price || !room) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      }

      const existingRoom = await Service.findOne({ roomNumber: room });
      if (existingRoom) {
        return res
          .status(400)
          .json({ message: "Phòng này đã được sử dụng cho một dịch vụ khác" });
      }
      if (price <= 0) {
        return res.status(400).json({ message: "Giá phải lớn hơn 0!" });
      }

      const service = new Service({
        paraclinalName: name,
        paraPrice: price,
        roomNumber: room,
      });
      await service.save();

      return res.status(201).json({
        message: "Tạo dịch vụ thành công",
        service,
      });
    } catch (error) {
      next(error);
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
      return res.status(500).json({ error: "Loi he thong" });
    }
  }

  async detailService(req, res) {
    try {
      const { serviceId } = req.body;

      if (!serviceId) {
        return res.status(404).json({ error: "Chua co service" });
      }

      const service = await Service.findById(serviceId);

      if (!service) {
        return res.status(404).json({ error: "Loi" });
      }

      return res.json({ service: service });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Loi he thong" });
    }
  }

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

      const duplicateRoom = await Service.findOne({
        roomNumber: room,
        _id: { $ne: serviceId },
      });
      if (duplicateRoom) {
        return res
          .status(400)
          .json({ message: "Phòng này đã được sử dụng cho một dịch vụ khác" });
      }
      if (price <= 0) {
        return res.status(400).json({ message: "Giá phải phải lớn hơn 0!" });
      }

      const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        {
          paraclinalName: name,
          paraPrice: price,
          roomNumber: room,
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

  async changeStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    if (!["available", "disable"].includes(status)) {
      return res.status(400).json({ message: "Giá trị status không hợp lệ." });
    }

    try {
      const updatedService = await ParaclinicalService.findByIdAndUpdate(
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
      return res
        .status(500)
        .json({ message: "Lỗi server.", error: err.message });
    }
  }

  async searchServiceByName(req, res) {
    try {
      const { name } = req.query;

      const query = name
        ? { paraclinalName: { $regex: name, $options: "i" } }
        : {};

      const services = await Service.find(query);

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
