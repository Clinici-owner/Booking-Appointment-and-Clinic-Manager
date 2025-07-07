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

async updateUserProfile(req, res, next) {
  try {
    const { userId, ...profileData } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId là bắt buộc",
      })
    }

    const allowedFields = ["fullName", "phone", "address", "dob", "gender", "avatar", "cidNumber"]
    const updateData = {}

    allowedFields.forEach((field) => {
      if (profileData.hasOwnProperty(field)) {
        if (field === "avatar") {
          if (profileData[field] && profileData[field] !== "" && profileData[field] !== "/img/dafaultAvatar.jpg") {
            updateData[field] = profileData[field]
          } else if (profileData[field] === "") {
            updateData[field] = "/img/dafaultAvatar.jpg"
          }
        } else if (field === "gender") {
          updateData[field] = profileData[field] === "true" || profileData[field] === true
        } else if (profileData[field] !== undefined && profileData[field] !== null) {
          updateData[field] = profileData[field]
        }
      }
    })

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có trường hợp lệ để cập nhật",
      })
    }

    // Validation cho phone
    if (updateData.phone) {
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(updateData.phone.replace(/\D/g, ""))) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại phải có đúng 10 số",
        })
      }
    }

    // Validation cho CMND/CCCD
    if (updateData.cidNumber) {
      const cidRegex = /^[0-9]{9}$|^[0-9]{12}$/
      if (!cidRegex.test(updateData.cidNumber)) {
        return res.status(400).json({
          success: false,
          message: "Số CMND phải có 9 số hoặc CCCD phải có 12 số",
        })
      }

      const existingUser = await User.findOne({
        cidNumber: updateData.cidNumber,
        _id: { $ne: userId },
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Số CMND/CCCD đã được sử dụng",
        })
      }
    }

    // Validation cho ngày sinh
    if (updateData.dob) {
      const birthDate = new Date(updateData.dob)
      const today = new Date()

      if (birthDate > today) {
        return res.status(400).json({
          success: false,
          message: "Ngày sinh không thể là ngày trong tương lai",
        })
      }
    }

    // Cập nhật user
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -otp -otpExpires")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      })
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: { user },
    })
  } catch (error) {
    console.error("Error in updateUserProfile:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ",
      })
    }

    res.status(500).json({
      success: false,
      message: "Lỗi server: " + error.message,
    })
  }
}
 async ChangeAccountPasswords(req, res) {
    const { userId, oldPassword, newPassword } = req.body;

    try {
      // Kiểm tra xem người dùng có tồn tại không
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      // Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
      }

      // Mã hóa mật khẩu mới
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
  //get all user by doctor role
  async getAllDoctors(req, res) {
    try {
      const doctors = await User.find({ role: "doctor" }).select("-password -otp -otpExpires");
      if (doctors.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy bác sĩ nào" });
      }
      res.status(200).json({ message: "Lấy danh sách bác sĩ thành công", data: doctors });
    } catch (error) {
      console.error("Lỗi lấy danh sách bác sĩ:", error);
      res.status(500).json({ message: "Lỗi server", error });
    }
  }
}
module.exports = new userController();