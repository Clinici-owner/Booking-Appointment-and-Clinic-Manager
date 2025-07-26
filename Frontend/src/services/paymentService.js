import axios from "axios";

const API_URL = "http://localhost:3000/api/payments";

export const createPayment = async (paymentData) => {
  try {
    console.log("Creating payment with data:", paymentData);
    const response = await axios.post(`${API_URL}/createPayment`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

export const getPayment = async (paymentId) => {
  try {
    const response = await axios.get(`${API_URL}/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
}

export const updatePayment = async (paymentId, paymentData) => {
  try {
    const response = await axios.put(`${API_URL}/${paymentId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
}

export const getPaymentByAppointmentId = async (appointmentId) => {
  try {
    const response = await axios.get(`${API_URL}/appointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payment by appointment ID:", error);
    throw error;
  }
}

export const getAllPayments = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching all payments:", error);
    throw error;
  }
}
