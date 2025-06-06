import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStaffById, updateStaff } from '../services/staffService';

function UpdateStaff() {
  const location = useLocation();
  const navigate = useNavigate();
  const staffId = location.state?.id;
  const [staff, setStaff] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!staffId) {
      alert('Không tìm thấy ID nhân viên.');
      return navigate('/staff');
    }

    async function fetchStaff() {
      try {
        const data = await getStaffById(staffId);
        setStaff(data);
      } catch (error) {
        console.error('Lỗi khi tải nhân viên:', error);
        alert('Lỗi khi tải dữ liệu nhân viên.');
        navigate('/staff');
      }
    }
    fetchStaff();
  }, [staffId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStaff({
      ...staff,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStaff(staffId, staff);
      setMessage('Cập nhật thành công!');
      navigate('/staff');
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      setMessage('Cập nhật thất bại!');
    }
  };

  if (!staff) return <p className="text-center p-12 text-lg text-gray-600">Đang tải dữ liệu...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-[#f9f9fb] rounded-xl shadow-md font-sans">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-5">Cập nhật thông tin nhân viên</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="fullName" value={staff.fullName} onChange={handleChange} placeholder="Họ và tên" required className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
        <input name="email" value={staff.email} onChange={handleChange} placeholder="Email" required className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
        <input name="phone" value={staff.phone || ''} onChange={handleChange} placeholder="Số điện thoại" className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
        <input name="address" value={staff.address || ''} onChange={handleChange} placeholder="Địa chỉ" className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />

        <select name="role" value={staff.role} onChange={handleChange} required className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
          <option value="receptionist">Lễ tân</option>
          <option value="doctor">Bác sĩ</option>
          <option value="technician">Kỹ thuật viên</option>
          <option value="admin">Quản trị viên</option>
        </select>

        <select name="gender" value={staff.gender ? 'true' : 'false'} onChange={handleChange} required className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
          <option value="true">Nam</option>
          <option value="false">Nữ</option>
        </select>

        <button type="submit" className="mt-2 px-4 py-2 text-sm font-bold text-white rounded-md bg-green-600 hover:bg-green-700">Lưu thay đổi</button>
        <button type="button" className="mt-2 px-4 py-2 text-sm font-bold text-white rounded-md bg-gray-600 hover:bg-gray-700" onClick={() => navigate('/staff')}>Quay về danh sách</button>
      </form>

      {message && <p className="mt-5 font-bold text-center text-[#1d3557]">{message}</p>}
    </div>
  );
}

export default UpdateStaff;
