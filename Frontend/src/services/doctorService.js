import axios from "axios";

const API_URL = "http://localhost:3000/api/doctorProfile";

export const DoctorService = {
  getDoctorProfileById: async (doctorId) => {
    try {
      const response = await axios.get(`${API_URL}/${doctorId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Trả về null nếu không tìm thấy
      }
      console.error("Error fetching doctor profile:", error);
      throw error;
    }
  },
  createDoctorProfile: async (profileData) => {
    try {
      const response = await axios.post(`${API_URL}/create`, profileData);
      return response.data;
    } catch (error) {
      console.error("Error creating doctor profile:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create doctor profile"
      );
    }
  },
};
