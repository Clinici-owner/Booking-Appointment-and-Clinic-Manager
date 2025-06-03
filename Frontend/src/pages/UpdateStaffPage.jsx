// src/pages/UpdateStaff.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStaffById, updateStaff } from '../services/staffService';

function UpdateStaff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    async function fetchStaff() {
      const data = await getStaffById(id);
      setStaff(data);
    }
    fetchStaff();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStaff({
      ...staff,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateStaff(id, staff);
    navigate('/staff');
  };

  if (!staff) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="update-staff-form">
      <h2>Cập nhật thông tin nhân viên</h2>
      <form onSubmit={handleSubmit}>
        <input name="fullName" value={staff.fullName} onChange={handleChange} placeholder="Họ và tên" />
        <input name="email" value={staff.email} onChange={handleChange} placeholder="Email" />
        <input name="phone" value={staff.phone || ''} onChange={handleChange} placeholder="Số điện thoại" />
        <input name="address" value={staff.address || ''} onChange={handleChange} placeholder="Địa chỉ" />
        <select name="role" value={staff.role} onChange={handleChange}>
          <option value="receptionist">Lễ tân</option>
          <option value="doctor">Bác sĩ</option>
          <option value="technician">Kỹ thuật viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <label>
          Nam:
          <input type="checkbox" name="gender" checked={staff.gender} onChange={handleChange} />
        </label>
        <button type="submit">Lưu thay đổi</button>
      </form>
    </div>
  );
}

export default UpdateStaff;
