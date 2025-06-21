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
};
