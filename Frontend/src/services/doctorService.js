import axios from "axios";

const API_URL =
  "http://localhost:3000/api/doctorProfile";

export const DoctorService = {
  getDoctorProfileById: async (doctorId) => {
    try {
      const response = await axios.get(`${API_URL}/${doctorId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
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
  getDoctorsBySpecialty: async (specialtyId) => {
    try {
      if (
        !specialtyId ||
        typeof specialtyId !== "string" ||
        specialtyId.trim() === ""
      ) {
        throw new Error("Invalid specialtyId");
      }

      const encodedId = specialtyId.trim();
      const url = `${API_URL}/specialties/${encodedId}`;

      const response = await axios.get(url);
      // Kiểm tra dữ liệu trả về
      if (!response.data || response.data.length === 0) {
        console.error("Không tìm thấy bác sĩ cho chuyên khoa:", specialtyId);
        return []; // Trả về mảng rỗng nếu không có bác sĩ
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error(`Không tìm thấy bác sĩ cho chuyên khoa: ${specialtyId}`);
        return []; // Trả về mảng rỗng khi không tìm thấy bác sĩ
      } else {
        console.error("Error fetching doctors by specialty:", error);
        throw error; // Ném lỗi khi có lỗi khác ngoài 404
      }
    }
  },
  getAllDoctors: async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors`);

      // Kiểm tra cấu trúc response
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Invalid response structure");
      }

      return {
        success: true,
        doctors: response.data.data,
      };
    } catch (error) {
      console.error(
        "Error fetching doctors:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch doctors"
      );
    }
  },
  getDoctorById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor:", error);
      throw error;
    }
  },
  updateDoctorProfile: async (id, profileData) => {
    try {
      const response = await axios.post(`${API_URL}/${id}`, profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      throw error;
    }
  },
};
