import axios from "axios";

const API_URL = "http://localhost:3000/api/patient";

export const PatientService = {
  getAllPatients: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch patients"
      );
    }
  },
  getPatientById: async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching patient:", error);
        throw new Error(
            error.response?.data?.message || "Failed to fetch patient"
        );
    }
},
};
