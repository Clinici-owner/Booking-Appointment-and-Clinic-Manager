import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createStaff, importStaffExcel } from '../services/staffService';

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

  const [errors, setErrors] = useState({});
  const [excelFile, setExcelFile] = useState(null);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const nameRegex = /^[\p{L}\s]+$/u;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{0,11}$/;
    const cidRegex = /^\d{0,12}$/;

    switch (name) {
      case 'fullName':
        if (value.length > 50 || !nameRegex.test(value)) {
          return 'Họ tên không hợp lệ. Chỉ được chứa chữ cái, không quá 50 ký tự.';
        }
        break;
      case 'email':
        if (!emailRegex.test(value)) {
          return 'Email không hợp lệ.';
        }
        break;
      case 'phone':
        if (!phoneRegex.test(value)) {
          return 'Số điện thoại không hợp lệ. Tối đa 11 chữ số.';
        }
        break;
      case 'cidNumber':
        if (!cidRegex.test(value)) {
          return 'CMND/CCCD không hợp lệ. Tối đa 12 chữ số.';
        }
        break;
      case 'password':
        if (value.length > 0 && value.length < 6) {
          return 'Mật khẩu phải có ít nhất 6 ký tự.';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'password' || name === 'confirmPassword') {
        setPasswordMismatch(updated.password !== updated.confirmPassword);
      }
      return updated;
    });

    const errorMessage = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
  };

  const isValidForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Mật khẩu không khớp.');
      return;
    }

    if (!isValidForm()) {
      return;
    }

    try {
      await createStaff(formData);
      setMessage('Tạo nhân viên thành công! Chuyển trang...');
      setTimeout(() => navigate('/staff'), 2000);
    } catch (error) {
      console.error('Lỗi tạo nhân viên:', error);
      setMessage('Tạo nhân viên thất bại!');
    }
  };

  const handleExcelSubmit = async () => {
    if (!excelFile) {
      setMessage('Vui lòng chọn tệp Excel');
      return;
    }

    try {
      await importStaffExcel(excelFile);
      setMessage('Import thành công! Chuyển trang...');
      setTimeout(() => navigate('/staff'), 2000);
    } catch (error) {
      console.error('Lỗi import Excel:', error);
      if (error.response) {
        setMessage(`${error.response.data?.error || 'Lỗi khi import Excel.'}`);
      } else {
        setMessage('Import thất bại!');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-[#f9f9fb] rounded-xl shadow-md font-sans">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-5">Tạo nhân viên mới</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Họ và tên:</label>
        <div>
          <input name="fullName" placeholder="Họ và tên" onChange={handleChange} value={formData.fullName} required className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
        </div>

          <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Email:</label>
        <div>
          <input name="email" placeholder="Email" onChange={handleChange} value={formData.email} required className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>

          <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Số điện thoại:</label>
        <div>
          <input name="phone" placeholder="Số điện thoại" onChange={handleChange} value={formData.phone} className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
        </div>

          <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">CMND/CCCD:</label>
        <div>
          <input name="cidNumber" placeholder="CMND/CCCD" onChange={handleChange} value={formData.cidNumber} required className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
          {errors.cidNumber && <p className="text-sm text-red-600">{errors.cidNumber}</p>}
        </div>

          <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
        <div className="relative flex items-center">
          <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" onChange={handleChange} value={formData.password} required className="w-full pr-10 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
          <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-gray-600 cursor-pointer text-lg">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

        <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
        <div className="relative flex items-center">
          <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" onChange={handleChange} value={formData.confirmPassword} required className="w-full pr-10 px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
          <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 text-gray-600 cursor-pointer text-lg">
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {passwordMismatch && <p className="text-sm font-semibold text-red-600">Mật khẩu không khớp.</p>}
        <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Ngày sinh:</label>
        <input name="dob" type="date" onChange={handleChange} value={formData.dob} className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
        <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Địa chỉ:</label>
        <input name="address" placeholder="Địa chỉ" onChange={handleChange} value={formData.address} className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />

        <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Vai trò:</label>
        <select name="role" onChange={handleChange} value={formData.role} className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
          <option value="receptionist">Lễ tân</option>
          <option value="doctor">Bác sĩ</option>
          <option value="technician">Kỹ thuật viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <label htmlFor="" className="flex flex-1/2 text-sm font-medium text-gray-700 mb-1">Giới tính:</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
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
        <label htmlFor="excelInput" className="flex-1 min-w-[180px] px-4 py-2 text-sm font-bold text-white text-center rounded-md bg-gray-600 hover:bg-gray-700 cursor-pointer">Chọn tệp Excel</label>
        <input
          id="excelInput"
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => setExcelFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <button onClick={handleExcelSubmit} className="flex-1 min-w-[180px] px-4 py-2 text-sm font-bold text-white rounded-md bg-blue-600 hover:bg-blue-700 text-center"> Nhập từ Excel</button>
        {excelFile && <p className="w-full mt-2 text-sm text-center text-gray-600">Tệp đã chọn: {excelFile.name}</p>}
      </div>

      {message && <p className="mt-5 font-bold text-center text-[#1d3557]">{message}</p>}
    </div>
  );
}

export default AddStaff;
