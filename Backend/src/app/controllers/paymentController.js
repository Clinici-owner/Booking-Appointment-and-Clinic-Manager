const Payment = require('../models/Payment');

class PaymentController {
    async createPayment(req, res) {
        const { appointmentId, examinationFee, serviceFee, method } = req.body;
    
        try {
        const payment = new Payment({
            appointmentId,
            examinationFee,
            serviceFee,
            method,
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
        const payment = await Payment.findById(id).populate('appointmentId');
    
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
            const updatedPayment = await Payment.findByIdAndUpdate(id, payment, { new: true });
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
}

module.exports = new PaymentController();
