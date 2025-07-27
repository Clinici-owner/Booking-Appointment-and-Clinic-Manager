import axios from "axios";

const API_URL = "https://booking-appointment-be.up.railway.app/api/room";

export const roomService = {
  getAllRooms: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  getUnusedRooms: async () => {
    try {
      const response = await axios.get(`${API_URL}/unused`);
      return response.data;
    } catch (error) {
      console.error("Error fetching unused rooms:", error);
      throw error;
    }
  },

  toggleRoomStatus: async (roomId) => {
    try {
      const response = await axios.put(`${API_URL}/${roomId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error("Error toggling room status:", error);
      throw error;
    }
  }
};
