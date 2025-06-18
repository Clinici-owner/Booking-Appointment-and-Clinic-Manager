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
      req.session.user = {
        _id: user._id,
        email: user.email,
        role: user.role,
      };

      // Loại bỏ trường nhạy cảm trước khi trả về
      const { password: _, otp, otpExpires, ...safeUser } = user.toObject();

      res.status(200).json({ message: "Đăng nhập thành công", user: safeUser });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      res.status(500).json({ message: "Lỗi server", error });
    }
  }

  async logoutUser(req, res) {
    try {
      // Xóa thông tin người dùng khỏi session
      req.session.destroy((err) => {
        if (err) {
          console.error("Lỗi đăng xuất:", err);
          return res.status(500).json({ message: "Lỗi server", error: err });
        }
        res.status(200).json({ message: "Đăng xuất thành công" });
      });
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      res.status(500).json({ message: "Lỗi server", error });
    }
  }

  async getSessionUser(req, res) {
    try {
      // Lấy thông tin người dùng từ session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
      }
      res.status(200).json({ message: "Lấy thông tin người dùng thành công", user });
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
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

  async forgotPassword(req, res) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Người dùng không tồn tại" });
      }

      // Tạo OTP và thời gian hết hạn
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút

      user.otp = otp;
      user.otpExpires = otpExpires;

      await user.save();

      // Gửi email chứa OTP
      const transporter = req.app.get("transporter");
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Mã xác nhận OTP",
        text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`,
      };

      try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Gửi mã OTP thành công" });
      } catch (error) {
        console.error("Lỗi gửi email:", error);
        return res.status(500).json({ message: "Lỗi gửi email", error });
      }
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
      return res.status(500).json({ message: "Lỗi server", error });
    }
  }
  async verifyForgotPassword(req, res) {
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
      await user.save();

      res.status(200).json({ message: "Xác nhận OTP thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }

  async resetPassword(req, res) {
    const { email, newPassword } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Người dùng không tồn tại" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
async  getUserProfileByUserID(req, res, next) {
  try {
    // Đọc userId từ query params thay vì req.body.user
    const userId = req.query.userId

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId là bắt buộc" })
    }

    const user = await User.findById(userId).select("-password -otp -otpExpires")

    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" })
    }

    res.status(200).json({ success: true, data: { user } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

async  updateUserProfile(req, res, next) {
  try {
    const { userId, fullName, phone, address, dob, gender, avatar } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId là bắt buộc" })
    }

    // Tạo object chứa các field cần update
    const updateData = {}
    if (fullName !== undefined) updateData.fullName = fullName
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (dob !== undefined) updateData.dob = dob
    if (gender !== undefined) updateData.gender = gender
    if (avatar !== undefined) updateData.avatar = avatar

    // Update user với các field mới
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Trả về document sau khi update
      runValidators: true, // Chạy validation
    }).select("-password -otp -otpExpires")

    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" })
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: { user },
    })
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    res.status(500).json({ success: false, message: error.message })
  }
}
}

module.exports = new userController();