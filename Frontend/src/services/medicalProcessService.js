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
};
