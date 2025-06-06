const User = require("../models/User");
const bcrypt = require("bcrypt");
class userController {
  async getAllUsers(req, res) {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  async loginUser(req, res) {
    const { email, password } = req.body;

    try {
      // Tìm người dùng theo email
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(400)
          .json({ message: "Email hoặc mật khẩu không đúng" });
      }

      // Kiểm tra trạng thái tài khoản
      if (user.status !== "active") {
        return res
          .status(400)
          .json({ message: "Tài khoản chưa được xác nhận" });
      }

      // Lưu thông tin vào session (hoặc trả về token nếu dùng JWT)
      req.session.user = user;
      req.session.isLoggedIn = true;

      res.status(200).json({ message: "Đăng nhập thành công", user });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      res.status(500).json({ message: "Lỗi server", error });
    }
  }

  async registerUser(req, res) {
    try {
      const { email, password } = req.body;

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }

      // Tạo OTP và hash mật khẩu
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút
      const hashedPassword = await bcrypt.hash(password, 10);

      // Lưu người dùng vào cơ sở dữ liệu
      const newUser = new User({
        email,
        password: hashedPassword,
        otp,
        otpExpires,
      });

      await newUser.save();

      // Gửi email OTP
      const transporter = req.app.get("transporter");
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Mã xác nhận OTP",
        text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        return res
          .status(201)
          .json({ message: "User created successfully. OTP sent to email." });
      } catch (error) {
        // Xóa người dùng nếu gửi email thất bại
        await User.findByIdAndDelete(newUser._id);
        return res
          .status(500)
          .json({ message: "Failed to send OTP email", error });
      }
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  }

  async verifyUser(req, res) {
    const { email, otp } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Người dùng không tồn tại" });
      }

      if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res
          .status(400)
          .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
      }

      // Xóa OTP sau khi xác nhận
      user.otp = undefined;
      user.otpExpires = undefined;
      user.status = "active"; // Cập nhật trạng thái người dùng thành "active"
      await user.save();

      res.status(200).json({ message: "Xác nhận OTP thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
}

module.exports = new userController();
