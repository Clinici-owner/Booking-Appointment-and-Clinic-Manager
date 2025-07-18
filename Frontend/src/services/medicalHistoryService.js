import axios from "axios";

const API_URL = "http://localhost:3000/api/medicalHistory";

export const MedicalHistoryService = {
  getMedicalHistoryByPatientId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/getByPatientId/${id}`);
      return response.data;
    } catch (error) {
        console.error("Error fetching medical history:", error);
        throw new Error(
            error.response?.data?.message || "Failed to fetch medical history"
        );
    }
},
  createMedicalHistory: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/create`, data);
      return response.data;
    } catch (error) {
        console.error("Error creating medical history:", error);
        throw new Error(
            error.response?.data?.message || "Failed to create medical history"
        );
    }
  },
  getMedicalHistoryByStepId: async (stepId) => {
    try {
      const response = await axios.get(`${API_URL}/getByStepId/${stepId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical history by step ID:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch medical history by step ID"
      );
    }
  },
  getAllMedicalHistories: async () => {
    try {
      const response = await axios.get(`${API_URL}/getAll`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all medical histories:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch all medical histories"
      );
    }
  }
};
