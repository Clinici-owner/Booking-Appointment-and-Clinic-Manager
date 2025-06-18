import axios from 'axios';

const API_URL =  'http://localhost:3000/api/service';


export const createMedicalService = async (data) => {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi tạo dịch vụ:', error);
    throw error;
  }
};

export const listService = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ:', error);
    throw error;
  }
};


export const editMedicalService = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi sửa dịch vụ:', error);
    throw error;
  }
};

export const updateServiceStatus = async (id, status) => {
  try {
    const res = await axios.patch(`${API_URL}/change-status/${id}`, { status });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái dịch vụ:', error);
    throw error;
  }
};