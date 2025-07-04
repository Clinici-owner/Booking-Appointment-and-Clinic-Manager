import axios from 'axios';

const API_URL = 'http://localhost:3000/api/schedules';

export const createSchedule = async (data) => {
    try {
        const res = await axios.post(API_URL, data);
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
            throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
        }
        // console.log('Fetching schedules for userId:', userId); 
        const res = await axios.get(`${API_URL}/own/${userId}`);
        if (!Array.isArray(res.data)) {
            throw new Error('Dữ liệu trả về không phải là một mảng hoặc có cấu trúc không hợp lệ.');
        }
        return res.data;
    } catch (error) {
        console.error('Lỗi khi lấy lịch trình cá nhân:', error);
        throw error;
    }
};

export const viewAllSchedules = async (page = 1, limit = 10, roomNumber = '', searchName = '') => {
    try {
        const params = { page, limit, roomNumber, searchName };
        const res = await axios.get(`${API_URL}/all`, { params });
        if (!Array.isArray(res.data.schedules)) {
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