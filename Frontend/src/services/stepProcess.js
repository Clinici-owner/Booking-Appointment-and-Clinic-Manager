import axios from 'axios';

const API_URL = 'http://localhost:3000/api/schedule';

const stepProcessService = {
  async getTechnicianRoomServices() {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));

      if (!user || !user._id) {
        throw new Error("Không tìm thấy userId trong sessionStorage");
      }

      const response = await axios.post(`${API_URL}/room`, {
        userId: user._id
      });

      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi API stepProcess:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default stepProcessService;
