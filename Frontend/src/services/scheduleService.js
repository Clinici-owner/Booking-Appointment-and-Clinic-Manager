export const getAllReceptionists = async () => {
    try {
        const res = await axios.get('https://booking-appointment-be.up.railway.app/api/schedules/receptionists');
        if (!Array.isArray(res.data)) {
            throw new Error('Dữ liệu lễ tân không hợp lệ.');
        }
        return res.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lễ tân:', error);
        throw error;
    }
};
import axios from 'axios';

const API_URL = 'https://booking-appointment-be.up.railway.app/api/schedules';

export const createSchedule = async (data) => {
    try {
        let payload = { ...data };
        if (payload.userId) {
            payload.userIds = Array.isArray(payload.userId) ? payload.userId : [payload.userId];
            delete payload.userId;
        }
        if (payload.date) {
            payload.dates = Array.isArray(payload.date) ? payload.date : [payload.date];
            delete payload.date;
        }
        console.log('Payload gửi lên khi tạo lịch trình:', payload);
        const res = await axios.post(API_URL, payload);
        return res.data;
    } catch (error) {
        console.error('Lỗi khi tạo lịch trình:', error);
        throw error;
    }
};

export const updateSchedule = async (id, data) => {
    try {
        const res = await axios.put(`${API_URL}/${id}`, data);
        return res.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật lịch trình:', error);
        throw error;
    }
};

export const deleteSchedule = async (id) => {
    try {
        const res = await axios.delete(`${API_URL}/${id}`);
        return res.data;
    } catch (error) {
        console.error('Lỗi khi xóa lịch trình:', error);
        throw error;
    }
};

export const getOwnSchedules = async (userId) => {
    try {
        if (!userId) {
            console.warn('Không tìm thấy ID người dùng. Trả về mảng rỗng.');
            return [];
        }

        const res = await axios.get(`${API_URL}/own/${userId}`);

        if (!Array.isArray(res.data)) {
            console.warn('Dữ liệu không phải là mảng. Trả về mảng rỗng.');
            return [];
        }

        return res.data;
    } catch (error) {
        const msg = error?.response?.data?.message || error.message || 'Lỗi không xác định';
        console.error('Lỗi khi lấy lịch trình cá nhân:', msg);
        return []; 
    }
};



// Lấy tất cả lịch trình (logic mới: trả về mảng schedule đã populate userId, room, specialties)
export const getAllSchedules = async () => {
    try {
        const res = await axios.get(`${API_URL}/all`);
        if (!Array.isArray(res.data)) {
            throw new Error('Dữ liệu lịch trình không hợp lệ.');
        }
        return res.data;
    } catch (error) {
        console.error('Lỗi khi lấy tất cả lịch trình:', error);
        throw error;
    }
};

export const getScheduleById = async (id) => {
    try {
        const res = await axios.get(`${API_URL}/${id}`);
        if (!res.data.schedule) {
            throw new Error('Dữ liệu chi tiết lịch trình không hợp lệ.');
        }
        return res.data.schedule;
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết lịch trình:', error);
        throw error;
    }
    
};

export const getSchedulesForRoomAndDay = async (roomId, day) => {
    try {
        const res = await axios.get(`${API_URL}/schedule/${roomId}/${day}`);
        return res.data; 
    } catch (error) {
        console.error('Lỗi khi lấy lịch trình cho phòng và ngày:', error);
        throw error;
    }
};

export const getSchedulesBySpecialtyAndDate = async (specialtyId, date) => {
  try {
    const res = await axios.get(`${API_URL}/schedule-by-specialty/${specialtyId}`, {
      params: { date }
    });
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch trình theo chuyên khoa và ngày:', error);
    throw error;
  }
};

export const getScheduleByDoctorAndShiftAndDate = async (doctorId, shift, date) => {
    try {
        const res = await axios.get(`${API_URL}/schedule-by-doctor/${doctorId}/${shift}/${date}`);
        return res.data; 
    } catch (error) {
        console.error('Lỗi khi lấy lịch trình theo bác sĩ, ca và ngày:', error);
        throw error;
    }
};

export const importSchedulesFromExcel = async (file) => {
    const API_URL = 'https://booking-appointment-be.up.railway.app/api/schedules/import-excel';
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await axios.post(API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    } catch (error) {
        console.error('Lỗi khi import lịch trình từ Excel:', error);
        throw error;
    }
};