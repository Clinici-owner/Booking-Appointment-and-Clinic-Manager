import axios from 'axios';

const API_URL = "http://localhost:3000/api/appointments";


const appointmentService = {
  createAppointment: async (appointmentData) => {
    try {
      console.log("Creating appointment with data:", appointmentData);
      const response = await axios.post(`${API_URL}/create`, {
        appointmentData
      });
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  getAppointments: async () => {
    try {
      console.log("Fetching all appointments");
      const response = await axios.get(`${API_URL}/appointments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  getAppointmentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointment by ID:", error);
      throw error;
    }
  },

  cancelAppointment: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/appointments/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Error canceling appointment:", error);
      throw error;
    }
  },

  getHealthPackages: async () => {
    try {
      const response = await axios.get('/api/booking/health-packages');
      return response.data;
    } catch (error) {
      console.error("Error fetching health packages:", error);
      throw error;
    }
  },

  getAppointmentsBySpecialty: async (specialtyId) => {
    try {
      const response = await axios.get(`${API_URL}/specialty/${specialtyId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments by specialty:", error);
      throw error;
    }
  }
};

export default appointmentService;
