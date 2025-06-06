import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStaff, importStaffExcel } from '../services/staffService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function AddStaff() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'receptionist',
    cidNumber: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    address: '',
  });

  const [excelFile, setExcelFile] = useState(null);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'password' || name === 'confirmPassword') {
        setPasswordMismatch(updated.password !== updated.confirmPassword);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Mật khẩu không khớp.');
      return;
    }
    try {
      await createStaff(formData);
      setMessage('✅ Tạo nhân viên thành công! Chuyển trang...');
      setTimeout(() => navigate('/staff'), 2000);
    } catch (error) {
      console.error('Lỗi tạo nhân viên:', error);
      setMessage('❌ Tạo nhân viên thất bại!');
    }
  };

  const handleExcelSubmit = async () => {
    if (!excelFile) {
      setMessage('❗ Vui lòng chọn tệp Excel');
      return;
    }

    try {
      await importStaffExcel(excelFile);
      setMessage('✅ Import thành công! Chuyển trang...');
      setTimeout(() => navigate('/staff'), 2000);
    } catch (error) {
      console.error('Lỗi import Excel:', error);
      if (error.response) {
        setMessage(`❌ ${error.response.data?.error || 'Lỗi khi import Excel.'}`);
      } else {
        setMessage('❌ Import thất bại!');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-[#f9f9fb] rounded-xl shadow-md font-sans">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-5">Tạo nhân viên mới</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="fullName" placeholder="Họ và tên" onChange={handleChange} required className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
        <input name="email" placeholder="Email" onChange={handleChange} required className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
        <input name="phone" placeholder="Số điện thoại" onChange={handleChange} className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
        <input name="cidNumber" placeholder="CMND/CCCD" onChange={handleChange} required className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />

        <div className="relative flex items-center">
          <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" onChange={handleChange} required className="w-full pr-10 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
          <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-gray-600 cursor-pointer text-lg">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="relative flex items-center">
          <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" onChange={handleChange} required className="w-full pr-10 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
          <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 text-gray-600 cursor-pointer text-lg">
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {passwordMismatch && <p className="text-sm font-semibold text-red-600">⚠️ Mật khẩu không khớp.</p>}

        <input name="dob" type="date" onChange={handleChange} className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
        <input name="address" placeholder="Địa chỉ" onChange={handleChange} className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />

        <select name="role" onChange={handleChange} className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
          <option value="receptionist">Lễ tân</option>
          <option value="doctor">Bác sĩ</option>
          <option value="technician">Kỹ thuật viên</option>
          <option value="admin">Quản trị viên</option>
        </select>

        <select name="gender" value={formData.gender} onChange={handleChange} required className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
          <option value="">Chọn giới tính</option>
          <option value="true">Nam</option>
          <option value="false">Nữ</option>
        </select>

        <button type="submit" className="px-4 py-2 text-sm font-bold text-white rounded-md bg-green-600 hover:bg-green-700">Tạo mới</button>
        <button type="button" onClick={() => navigate('/staff')} className="px-4 py-2 text-sm font-bold text-white rounded-md bg-gray-600 hover:bg-gray-700">Quay về danh sách</button>
      </form>

      <div className="relative text-center font-bold text-gray-500 my-6">
        <span className="relative z-10 px-3 bg-[#f9f9fb]">hoặc</span>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 z-0"></div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <label htmlFor="excelInput" className="flex-1 min-w-[180px] px-4 py-2 text-sm font-bold text-white text-center rounded-md bg-gray-600 hover:bg-gray-700 cursor-pointer">📂 Chọn tệp Excel</label>
        <input
          id="excelInput"
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setExcelFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <button onClick={handleExcelSubmit} className="flex-1 min-w-[180px] px-4 py-2 text-sm font-bold text-white rounded-md bg-blue-600 hover:bg-blue-700 text-center">📥 Nhập từ Excel</button>
        {excelFile && <p className="w-full mt-2 text-sm text-center text-gray-600">Tệp đã chọn: {excelFile.name}</p>}
      </div>

      {message && <p className="mt-5 font-bold text-center text-[#1d3557]">{message}</p>}
    </div>
  );
}

export default AddStaff;
