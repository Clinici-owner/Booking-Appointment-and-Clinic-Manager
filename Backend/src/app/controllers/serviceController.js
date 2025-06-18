const Service = require("../models/ParaclinicalService");

class serviceController {
  async createService(req, res, next) {
    try {
      const { name, price, room } = req.body;

      if (!name || !price || !room) {
        return res
          .status(400)
          .json({ message: "Missing required information" });
      }

      const service = new Service({
        paraclinalName: name,
        paraPrice: price,
        roomNumber: room,
      });
      await service.save();
      return res.status(201).json({
        message: "Create service successfully",
        service: service,
      });
    } catch (error) {
      next(error);
    }
  }

  async listService(req, res){
    try{

      const servicelist = await Service.find();

      return res.status(200).json({
      message: "Lấy danh sách dịch vụ thành công",
      services: servicelist,
    });

    }catch (error) {
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

      if(!service){
        return res.status(404).json({error: "Loi"});
      }

      return res.json({ service: service });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Loi he thong" });
    }
  }

  async editService(req, res, next) {
  try {
    const { serviceId, name, price, room, status } = req.body;

    if (!serviceId || !name || !price || !room || !status) {
      return res.status(400).json({ message: "Missing required information" });
    }

    if (!['available', 'disable'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      {
        paraclinalName: name,
        paraPrice: price,
        roomNumber: room,
        status: status,
      },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({
      message: "Update service successfully",
      service: updatedService,
    });
  } catch (error) {
    next(error);
  }
}

  async  changeStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

  
      if (!['available', 'disable'].includes(status)) {
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
    return res.status(500).json({ message: "Lỗi server.", error: err.message });
  }
}



}

module.exports = new serviceController();
