const Payment = require("../models/Payment");

class PaymentController {
  async createPayment(req, res) {
    const paymentData = req.body;

    try {
      const payment = new Payment({
        appointmentId: paymentData.appointmentId,
        examinationFee: paymentData.examinationFee,
        status: "paid", // Assuming the payment is created as paid
        serviceFee: Array.isArray(paymentData.serviceFee)
          ? paymentData.serviceFee.map((service) => ({
              serviceId: service.serviceId,
              fee: service.fee || 0,
            }))
          : [],
        methodExam: paymentData.methodExam,
        methodService: paymentData.methodService,
      });

      await payment.save();

      res.status(201).json({
        message: "Payment created successfully",
        payment,
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment", error });
    }
  }

  async getPayment(req, res) {
    const { id } = req.params;

    try {
      const payment = await Payment.findById(id)
        .populate("appointmentId")
        .populate("serviceFee.serviceId");

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.status(200).json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ message: "Failed to fetch payment", error });
    }
  }

  async updatePayment(req, res) {
    const payment = req.body;
    const { id } = req.params;
    try {
      const updatedPayment = await Payment.findByIdAndUpdate(id, payment, {
        new: true,
      });
      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(200).json({
        message: "Payment updated successfully",
        payment: updatedPayment,
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment", error });
    }
  }

  //get payment by appointmentId
  async getPaymentByAppointmentId(req, res) {
    const { appointmentId } = req.params;

    try {
      const payment = await Payment.findOne({ appointmentId })
        .populate("appointmentId")
        .populate({
          path: "serviceFee.serviceId",
          populate: {
            path: "room", // <- populate field room trong ParaclinicalService
          },
        });

      res.status(200).json(payment);
    } catch (error) {
      console.error("Error fetching payment by appointmentId:", error);
      res.status(500).json({ message: "Failed to fetch payment", error });
    }
  }

  async getAllPayment(req, res) {
    try {
      const payments = await Payment.find();
      res.status(200).json(payments);
    } catch (error) {
      console.error("Error fetching all payments:", error);
      res.status(500).json({ message: "Failed to fetch all payments", error });
    }
  }
}

module.exports = new PaymentController();
