import axios from 'axios';

const API_URL = 'https://booking-appointment-be.up.railway.app/api/service';
const ROOM_API_URL = 'https://booking-appointment-be.up.railway.app/api/room';
const SPECIALY_API_URL = 'https://booking-appointment-be.up.railway.app/api/specialty';

export const createMedicalService = async (data) => {
  try {
    const res = await axios.post(API_URL, data, {
      headers: {
        'Content-Type': 'application/json', 
      },
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi tạo dịch vụ:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const listService = async () => {
  try {
    const res = await axios.get(API_URL);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const editMedicalService = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, {
      name: data.name,          
      price: data.price,       
      room: data.room,          
      status: data.status       
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi sửa dịch vụ:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateServiceStatus = async (id, status) => {
  try {
    const res = await axios.patch(`${API_URL}/change-status/${id}`, { status }, {
      headers: {
        'Content-Type': 'application/json', 
      },
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái dịch vụ:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAvailableRooms = async () => {
  try {
    const res = await axios.get(`${ROOM_API_URL}/unused`);
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng:', error);
    throw error;
  }
};



export const getSpecialties = async () => {
  try {
    const res = await axios.get(SPECIALY_API_URL);
    return res.data; 
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chuyên khoa:', error.response ? error.response.data : error.message);
    throw error;
  }
};


export const getRoomsBySpecialty = async (specialtyId) => {
  try {
    const res = await axios.get(`${SPECIALY_API_URL}/rooms/${specialtyId}`);
    return res.data.rooms;
  } catch (error) {
    console.error('Lỗi khi lấy phòng theo chuyên khoa:', error.response ? error.response.data : error.message);
    throw error;
  }
};
