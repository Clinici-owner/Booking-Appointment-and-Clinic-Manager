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
      const {serviceId, name, price, room } = req.body;

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



}

module.exports = new serviceController();
