import axios from 'axios';
const API_URL = "http://localhost:3000/api/specialty";

export const createSpecialty = async (specialtyData) => {
  try {
    console.log("Creating specialty with data:", specialtyData);

    const response = await axios.post(`${API_URL}/create`, { dataSpecialty: specialtyData });
    return response.data;
  } catch (error) {
    console.error("Error creating specialty:", error);
    throw error;
  }
}   

export const getAllSpecialties = async () => {
  try {
    const response = await axios.get(`${API_URL}/getAll`);
    return response.data;
  } catch (error) {
    console.error("Error fetching specialties:", error);
    throw error;
  }
}