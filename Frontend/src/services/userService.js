import axios from "axios";

const API_URL = "http://localhost:3000/api/user";

export const UserService = {
  login: async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    console.log("Đăng nhập thành công:", res.data);
    if (res.data && res.data.user) {
      const userData = {
        ...res.data.user,
        expiresAt: Date.now() + 3600000, // hết hạn sau 1h
      };
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
    window.location.href = "/";
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
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
        throw new Error("User object hoặc user ID không hợp lệ")
      }

      console.log("Calling API with user:", user) // Debug log

      // Tạo URL với đường dẫn đúng
      const url = new URL(`${API_URL}/profile`)
      url.searchParams.append("userId", user._id)

      console.log("Request URL:", url.toString()) // Debug log

      // Sử dụng GET method
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status) // Debug log
      console.log("Response ok:", response.ok) // Debug log

      // Kiểm tra response status
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText) // Debug log
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log("API Response:", result) // Debug log - Kiểm tra structure của response

      return result
    } catch (error) {
      console.error("Error in getUserProfileByUserID:", error)
      throw error
    }
  },
  updateUserProfile: async (userId, profileData) => {
    try {
      if (!userId) {
        throw new Error("User ID là bắt buộc")
      }

      console.log("Updating profile for user:", userId, profileData)

      const response = await fetch(`${API_URL}/updateprofile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          ...profileData,
        }),
      })

      console.log("Update response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update error response:", errorData)
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log("Update API Response:", result)

      return result
    } catch (error) {
      console.error("Error in updateUserProfile:", error)
      throw error
    }
  },
};
