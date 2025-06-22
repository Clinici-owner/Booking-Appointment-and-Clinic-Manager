import axios from 'axios';
const API_URL = "http://localhost:3000/api/specialty";

export const createSpecialty = async (specialtyData) => {
  try {
    const response = await axios.post(`${API_URL}/create`, { dataSpecialty: specialtyData });
    return response.data;
  } catch (error) {
    console.error("Error creating specialty:", error);
    throw error;
  }
}   

export const getAllSpecialties = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching specialties:", error);
    throw error;
  }
}

  export const getSpecialtyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching specialty by ID:", error);
    throw error;
  } 
}

export const lockSpecialty = async (id, status) => {
  try {
    const response = await axios.put(`${API_URL}/lock/${id}`, {status});
    return response.data;
  } catch (error) {
    console.error("Error locking specialty:", error);
    throw error;
  }
}