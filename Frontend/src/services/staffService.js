import axios from 'axios';

const API_URL = 'http://localhost:3000/api/staff';

export const listStaff = async () => {
  try {
    const res = await axios.get(API_URL);
    if (!Array.isArray(res.data)) {
      throw new Error('Dữ liệu trả về không phải là một mảng');
    }
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
    throw error;
  }
};

export const toggleLockStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'locked' ? 'active' : 'locked';
  try {
    const res = await axios.put(`http://localhost:3000/api/staff/lock/${id}`, { status: newStatus });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    throw error;
  }
};



export const getStaffById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhân viên:', error);
    throw error;
  }
};

export const createStaff = async (data) => {
  try {
    const res = await axios.post(API_URL, data);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi tạo nhân viên:', error);
    throw error;
  }
};

export const updateStaff = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên:', error);
    throw error;
  }
};

export const importStaffExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post(`${API_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi import Excel:', error);
    throw error;
  }
};
