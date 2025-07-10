import axios from "axios";

const SCHEDULE_API_URL = "http://localhost:3000/api/schedules";
const PROCESS_API_URL = "http://localhost:3000/api/medicalProcess";

const stepProcessService = {

  async getTechnicianRoomServices() {
    try {
      const userStr = sessionStorage.getItem("user");
      if (!userStr) throw new Error("Không tìm thấy thông tin người dùng.");

      const user = JSON.parse(userStr);
      if (!user._id) throw new Error("Không có userId hợp lệ.");

      const response = await axios.get(`${SCHEDULE_API_URL}/room/${user._id}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi gọi API stepProcess:",
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message
      );
      throw error;
    }
  },

  /**
   * @param {string} userId 
   */
  async completeCurrentStep(userId) {
    try {
      if (!userId) throw new Error("Thiếu userId khi gọi completeStep.");

      const response = await axios.post(`${PROCESS_API_URL}/complete-step/${userId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Lỗi khi gọi completeCurrentStep:",
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message
      );
      throw error;
    }
  },
};

export default stepProcessService;
