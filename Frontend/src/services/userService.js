import axios from "axios";

const API_URL = "http://localhost:3000/api/user";

export const UserService = {
  login: async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const expiresAt = Date.now() + 60 * 60 * 1000; // 60 phút
      localStorage.setItem(
        "user",
        JSON.stringify({
          data: res.data.user,
          expiresAt,
        })
      );
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
};
