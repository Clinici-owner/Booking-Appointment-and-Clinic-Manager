import axios from "axios";

const API_URL = "http://localhost:3000/api/room";

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
  }
};
