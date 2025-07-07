import axios from "axios";

const API_URL = "http://localhost:3000/api/healthPackage";

export const healthPackageService = {
    getAllHealthPackages: async () => {
    try {
      const response = await axios.get(`${API_URL}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách gói khám")
    }
  },
   

  // Lấy chi tiết gói khám
  getHealthPackageById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/detail/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy thông tin gói khám")
    }
  },

  // Tạo gói khám mới
  createHealthPackage: async (packageData) => {
    try {
      const response = await axios.post(`${API_URL}/admin/create`, packageData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lỗi khi tạo gói khám")
    }
  },

  // Cập nhật gói khám
  updateHealthPackage: async (id, updateData) => {
    try {
      const response = await axios.put(`${API_URL}/admin/update/${id}`, updateData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lỗi khi cập nhật gói khám")
    }
  },

  // Thay đổi trạng thái gói khám (lock/unlock)
  togglePackageStatus: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/admin/lockstatus/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lỗi khi thay đổi trạng thái gói khám")
    }
  },
  // Lấy chỉ tên dịch vụ cận lâm sàng theo package ID (mảng string đơn giản)
  getParaclinicalNamesOnly: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/paraclinicalname/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy tên dịch vụ cận lâm sàng")
    }
  },
}