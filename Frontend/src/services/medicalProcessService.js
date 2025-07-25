import axios from "axios";

const API_URL = "http://localhost:3000/api/medicalProcess";

export const MedicalProcessService = {
  // Lấy quy trình khám theo appointmentId
  getMedicalProcessByAppointmentId: async (appointmentId) => {
    try {
      const response = await axios.get(`${API_URL}/by-appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical process by appointmentId:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch medical process by appointmentId"
      );
    }
  },
  createProcessStep: async (processStep) => {
    try {
      const response = await axios.post(`${API_URL}/step/create`, processStep);
      return response.data;
    } catch (error) {
      console.error("Error creating process steps:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create process steps"
      );
    }
  },
  createMedicalProcess: async (medicalProcess) => {
    try {
      const response = await axios.post(`${API_URL}/create`, medicalProcess);
      return response.data;
    } catch (error) {
      console.error("Error creating medical process:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create medical process"
      );
    }
  },
  getAllMedicalProcesses: async () => {
    try {
      const response = await axios.get(`${API_URL}/getAll`);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical processes:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch medical processes"
      );
    }
  },
  getMedicalProcessById: async (processId) => {
    try {
      const response = await axios.get(`${API_URL}/${processId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical process:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch medical process"
      );
    }
  },
  updateMedicalProcessStatus : async (processId, status) => {
    try {
      const response = await axios.post(`${API_URL}/updateStatus/${processId}`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating medical process status:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update medical process status"
      );
    }
  },

  getMyProcessByUserId: async () => {
    try {
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?._id;

      if (!userId) {
        throw new Error("Người dùng chưa đăng nhập hoặc không hợp lệ.");
      }

      const response = await axios.get(`${API_URL}/my-process/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching patient's medical process:", error);
      throw new Error(
        error.response?.data?.message ||
          "Hiện tại bạn chưa có tiến trình nào"
      );
    }
  },

  updateMedicalProcessFinalResult: async (processId, finalResult) => {
    try {
      const response = await axios.post(`${API_URL}/update-final-result/${processId}`, { finalResult });
      return response.data;
    } catch (error) {
      console.error("Error updating medical process final result:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update medical process final result"
      );
    }
  },
};
