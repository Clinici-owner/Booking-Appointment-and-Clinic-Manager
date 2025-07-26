import axios from "axios";

const SCHEDULE_API_URL = "https://booking-appointment-be.up.railway.app/api/schedules";
const PROCESS_API_URL = "https://booking-appointment-be.up.railway.app/api/medicalProcess";

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

  getTodayProcessStepsByRoom: async () => {
    const roomData = await stepProcessService.getTechnicianRoomServices();
    const roomId = roomData?.roomId || roomId;
    try {
      const response = await axios.get(`${PROCESS_API_URL}/process-steps/today/${roomId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching today's process steps by room:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch today's process steps by room"
      );
    }
  },

  updateProcessStepNotes: async (stepId, notes) => {
    try {
      const response = await axios.post(`${PROCESS_API_URL}/step/update-notes/${stepId}`, { notes });
      return response.data;
    } catch (error) {
      console.error("Error updating process step notes:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update process step notes"
      );
    }
  }
}

export default stepProcessService;
