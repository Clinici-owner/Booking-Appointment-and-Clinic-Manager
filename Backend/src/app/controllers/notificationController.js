const Notification = require('../models/Notification');

class NotificationController {
  async createNotification(req, res) {
    const { userId, title, message } = req.body;
    try {
      const noti = new Notification({ userId, title, message });
      await noti.save();
      console.log("Tạo thông báo mới:", noti);
      res.status(201).json(noti);
    } catch (error) {
      console.error("Lỗi khi tạo thông báo:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  async getUserNotifications(req, res) {
    const { userId } = req.params;
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);
      console.log(`Trả về ${notifications.length} thông báo cho user ${userId}`);
      res.status(200).json(notifications); 
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      res.status(500).json({ message: "Lỗi khi lấy thông báo" });
    }
  }
}

module.exports = new NotificationController();
