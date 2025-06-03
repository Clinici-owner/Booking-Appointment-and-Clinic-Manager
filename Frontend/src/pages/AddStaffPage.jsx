// src/pages/AddStaff.jsx
import { useState } from 'react';
import { createStaff, importStaffExcel } from '../services/staffService';
import { useNavigate } from 'react-router-dom';

function AddStaff() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'receptionist',
    cidNumber: '',
    password: '',
    dob: '',
    gender: true,
    address: '',
  });

  const [excelFile, setExcelFile] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createStaff(formData);
    navigate('/staff');
  };

  const handleExcelSubmit = async () => {
    if (!excelFile) return;
    const data = new FormData();
    data.append('file', excelFile);
    await importStaffExcel(data);
    navigate('/staff');
  };

  return (
    <div className="add-staff-form">
      <h2>Tạo nhân viên mới</h2>
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Họ và tên" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Số điện thoại" onChange={handleChange} />
        <input name="cidNumber" placeholder="CMND/CCCD" onChange={handleChange} required />
        <input name="password" placeholder="Mật khẩu" type="password" onChange={handleChange} required />
        <input name="dob" type="date" onChange={handleChange} />
        <input name="address" placeholder="Địa chỉ" onChange={handleChange} />
        <select name="role" onChange={handleChange}>
          <option value="receptionist">Lễ tân</option>
          <option value="doctor">Bác sĩ</option>
          <option value="technician">Kỹ thuật viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <label>
          Nam:
          <input type="checkbox" name="gender" checked={formData.gender} onChange={handleChange} />
        </label>
        <button type="submit">Tạo mới</button>
      </form>

      <hr />

      <h3>Hoặc nhập từ file Excel</h3>
      <input type="file" accept=".xlsx" onChange={(e) => setExcelFile(e.target.files[0])} />
      <button onClick={handleExcelSubmit}>Nhập từ Excel</button>
    </div>
  );
}

export default AddStaff;
