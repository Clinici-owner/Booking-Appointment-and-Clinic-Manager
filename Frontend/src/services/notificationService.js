import axios from "axios";

const API_URL = "https://booking-appointment-be.up.railway.app/api/notifications"; 


export const getNotificationsByUser = async (userId) => {
  try {
    const res = await axios.get(`${API_URL}/${userId}`);
    if (!Array.isArray(res.data)) {
      throw new Error("Dữ liệu trả về không hợp lệ");
    }
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách thông báo:", err);
    throw err;
  }
};


export const createNotification = async (data) => {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi tạo thông báo:", err);
    throw err;
  }
};
