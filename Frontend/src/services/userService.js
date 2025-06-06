import axios from "axios";

const API_URL = "http://localhost:3000/api/user";

export const UserService = {
  login: async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      window.location.href = "/home";
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  },
};
