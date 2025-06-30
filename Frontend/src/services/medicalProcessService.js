import axios from "axios";

const API_URL = "http://localhost:3000/api/medicalProcess";

export const MedicalProcessService = {
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
};
