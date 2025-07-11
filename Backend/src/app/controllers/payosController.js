const PayOS = require("@payos/node");
require("dotenv").config();

const payos = new PayOS(
  process.env.CLIENT_ID,
  process.env.API_KEY,
  process.env.CHECKSUM_KEY
);

class payosController {
  async createPayment(req, res) {
    const { orderCode, amount, description, returnUrl, cancelUrl } = req.body;

    try {
      const payment = await payos.createPaymentLink({
        orderCode,
        amount,
        description,
        returnUrl,
        cancelUrl,
      });

      res.status(200).json({
        message: "Payment created successfully",
        paymentUrl: payment.checkoutUrl,
        qrCode: payment.qrCode,
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment", error });
    }
  }

  async verifyPayment(req, res) {
    const { orderCode } = req.body;

    try {
      const paymentStatus = await payos.getPaymentLinkInformation(orderCode);

      if (paymentStatus.status === "PAID") {
        res.status(200).json({
          message: "Payment verified successfully",
          status: paymentStatus.status,
        });
      } else {
        res.status(400).json({
          message: "Payment not completed",
          status: paymentStatus.status,
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment", error });
    }
  }
}

module.exports = new payosController();
