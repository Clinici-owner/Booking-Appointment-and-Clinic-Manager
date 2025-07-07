import axios from 'axios';

const API_BASE_URL = '/api/booking'; 

const bookingService = {
  createAppointment: async (appointmentData) => {
    const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData);
    return response.data;
  },

  getAppointments: async () => {
    const response = await axios.get(`${API_BASE_URL}/appointments`);
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/appointments/${id}`);
    return response.data;
  },

  cancelAppointment: async (id) => {
    const response = await axios.put(`${API_BASE_URL}/appointments/${id}/cancel`);
    return response.data;
  },

   getHealthPackages: async () => {
    const response = await axios.get('/api/booking/health-packages');
    return response.data; 
  },
};

export default bookingService;
