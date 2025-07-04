import axios from "axios";
import { DoctorService } from "./doctorService";

const API_URL = "http://localhost:3000/api/user";

export const UserService = {
  login: async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });

      if (!res.data?.user) {
        throw new Error("Dữ liệu người dùng không hợp lệ từ server");
      }

      console.log("Đăng nhập thành công:", res.data);

      // Lưu thông tin user
      const userData = {
        ...res.data.user,
        expiresAt: Date.now() + 3600000, // 1 giờ
        token: res.data.token, // Giả sử server trả về token
      };
      sessionStorage.setItem("user", JSON.stringify(userData));

      // Xử lý redirect
      switch (res.data.user.role) {
        case "admin":
          window.location.href = "/admin/staffs";
          break;
        case "doctor":
          try {
            const doctorProfile = await DoctorService.getDoctorProfileById(
              res.data.user._id
            );
            window.location.href = doctorProfile
              ? "/doctor/createMedicalProcess"
              : "/doctor/createDoctorProfile";
          } catch (error) {
            console.error("Lỗi khi kiểm tra hồ sơ bác sĩ:", error);
            window.location.href = "/doctor/createDoctorProfile";
          }
          break;
        default:
          window.location.href = "/doctor/createMedicalProcess";
      }

      return res.data;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Đăng nhập thất bại"
      );
    }
  },

  register: async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/register`, { email, password });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
  },

  verify: async (email, otp) => {
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Xác thực OTP thất bại");
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Quên mật khẩu thất bại"
      );
    }
  },

  verifyForgotPassword: async (email, otp) => {
    try {
      const res = await axios.post(`${API_URL}/verify-forgot-password`, {
        email,
        otp,
      });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Xác thực quên mật khẩu thất bại"
      );
    }
  },

  resetPassword: async (email, newPassword) => {
    try {
      const res = await axios.post(`${API_URL}/reset-password`, {
        email,
        newPassword,
      });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Đặt lại mật khẩu thất bại"
      );
    }
  },
  getUserProfileByUserID: async (user) => {
    try {
      // Kiểm tra user object
      if (!user || !user._id) {
        throw new Error("User object hoặc user ID không hợp lệ");
      }

      console.log("Calling API with user:", user); // Debug log

      // Tạo URL với đường dẫn đúng
      const url = new URL(`${API_URL}/profile`);
      url.searchParams.append("userId", user._id);

      console.log("Request URL:", url.toString()); // Debug log

      // Sử dụng GET method
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Kiểm tra response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText); // Debug log
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error("Error in getUserProfileByUserID:", error);
      throw error;
    }
  },
  // userService.js
  updateUserProfile: async (userId, profileData) => {
    try {

      // 🚨 QUAN TRỌNG: Đảm bảo avatar được include
      const requestBody = {
        userId: userId,
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        dob: profileData.dob,
        gender: profileData.gender,
        avatar: profileData.avatar, // 🔥 Explicitly include avatar
        cidNumber: profileData.cidNumber,
      };

      const response = await fetch(`${API_URL}/updateprofile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Service error:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },
  ChangeAccountPasswords: async (userId, oldPassword, newPassword) => {
    try {
      const res = await axios.put(`${API_URL}/updatepassword`, {
        userId,
        oldPassword,
        newPassword,
      });
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Thay đổi mật khẩu thất bại"
      );
    }
  },
  //get all doctors
  getAllDoctors: async () => {
    try {
      const res = await axios.get(`${API_URL}/get-all-doctors`);
      return res.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách bác sĩ thất bại"
      );
    }
  },
};
