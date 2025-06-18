import { saveAs } from 'file-saver';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdminNavSidebar from '../components/AdminNavSidebar';
import Header from '../components/Header';
import { createStaff, importStaffExcel } from '../services/staffService';

function AddStaff() {
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', role: 'receptionist', cidNumber: '',
        password: '', confirmPassword: '', dob: '', gender: '', address: '',
    });

    const [errors, setErrors] = useState({});
    const [excelFile, setExcelFile] = useState(null);
    const [notification, setNotification] = useState(null);
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
            setNotification('Mật khẩu không khớp.');
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        if (!isValidForm()) {
            return;
        }

        try {
            await createStaff(formData);
            setNotification('Tạo nhân viên thành công!');
            setTimeout(() => setNotification(null), 3000);
            setTimeout(() => navigate('/staff'), 3000);
        } catch (error) {
            console.error('Lỗi tạo nhân viên:', error);
            setNotification('Tạo nhân viên thất bại!');
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleExcelSubmit = async () => {
        if (!excelFile) {
            setNotification('Vui lòng chọn tệp Excel');
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        try {
            await importStaffExcel(excelFile);
            setNotification('Import thành công!');
            setTimeout(() => setNotification(null), 3000);
            setTimeout(() => navigate('/staff'), 2000);
        } catch (error) {
            console.error('Lỗi import Excel:', error);
            if (error.response) {
                setNotification(`${error.response.data?.error || 'Lỗi khi import Excel.'}`);
            } else {
                setNotification('Import thất bại!');
            }
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleDownloadTemplate = () => {
        const data = [
            ['cidNumber', 'password', 'fullName', 'dob', 'role', 'phone', 'email', 'gender', 'address'],
            ['123456789', 'password123', 'Nguyễn Văn A', '1990-01-01', 'receptionist', '0901234567', 'nguyenvana@example.com', 'TRUE', '123 Đường ABC, TP.HCM'],
            ['987654321', 'abc123456', 'Trần Thị B', '1992-06-15', 'doctor', '0912345678', 'tranthib@example.com', 'FALSE', '456 Đường XYZ, Hà Nội']
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'MAU_EXCEL.xlsx');
    };

    return (
        <div className="flex bg-[#F3F6F9] min-h-screen text-[18px] leading-[1.75]">
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex">
                    <AdminNavSidebar />
                    <div className="w-full max-w-[1600px] mx-auto p-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                        <h2 className="text-[#212B36] font-bold text-4xl leading-6">
                            Tạo nhân viên mới
                        </h2>
                    </div>

                    {/* Success Notification */}
                    {notification && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
                            {notification}
                        </div>
                    )}

                    <div className="bg-white rounded-lg border border-[#D9D9D9] p-6">
                        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                            {/* Họ và tên */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Họ và tên"
                                    onChange={handleChange}
                                    value={formData.fullName}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    required
                                />
                                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                            </div>
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm text-gray-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    onChange={handleChange}
                                    value={formData.email}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    required
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>
                            {/* Số điện thoại */}
                            <div>
                                <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    placeholder="Số điện thoại"
                                    onChange={handleChange}
                                    value={formData.phone}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                            </div>
                            {/* CMND/CCCD */}
                            <div>
                                <label htmlFor="cidNumber" className="block text-sm text-gray-700 mb-1">CMND/CCCD</label>
                                <input
                                    id="cidNumber"
                                    name="cidNumber"
                                    type="text"
                                    placeholder="CMND/CCCD"
                                    onChange={handleChange}
                                    value={formData.cidNumber}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    required
                                />
                                {errors.cidNumber && <p className="text-sm text-red-600">{errors.cidNumber}</p>}
                            </div>
                            {/* Mật khẩu */}
                            <div>
                                <label htmlFor="password" className="block text-sm text-gray-700 mb-1">Mật khẩu</label>
                                <div className="relative flex items-center">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Mật khẩu"
                                        onChange={handleChange}
                                        value={formData.password}
                                        className="w-full pr-10 px-4 py-3 text-sm border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                    />
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-gray-600 cursor-pointer text-lg">
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                            </div>
                            {/* Nhập lại mật khẩu */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-1">Nhập lại mật khẩu</label>
                                <div className="relative flex items-center">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Nhập lại mật khẩu"
                                        onChange={handleChange}
                                        value={formData.confirmPassword}
                                        className="w-full pr-10 px-4 py-3 text-sm border border-gray-200 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                    />
                                    <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 text-gray-600 cursor-pointer text-lg">
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </span>
                                </div>
                                {passwordMismatch && <p className="text-sm font-semibold text-red-600">Mật khẩu không khớp.</p>}
                            </div>
                            {/* Ngày sinh */}
                            <div>
                                <label htmlFor="dob" className="block text-sm text-gray-700 mb-1">Ngày sinh</label>
                                <input
                                    id="dob"
                                    name="dob"
                                    type="date"
                                    onChange={handleChange}
                                    value={formData.dob}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            {/* Địa chỉ */}
                            <div>
                                <label htmlFor="address" className="block text-sm text-gray-700 mb-1">Địa chỉ</label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    placeholder="Địa chỉ"
                                    onChange={handleChange}
                                    value={formData.address}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            {/* Vai trò */}
                            <div>
                                <label htmlFor="role" className="block text-sm text-gray-700 mb-1">Vai trò</label>
                                <select
                                    id="role"
                                    name="role"
                                    onChange={handleChange}
                                    value={formData.role}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="receptionist">Lễ tân</option>
                                    <option value="doctor">Bác sĩ</option>
                                    <option value="technician">Kỹ thuật viên</option>
                                    <option value="admin">Quản trị viên</option>
                                </select>
                            </div>
                            {/* Giới tính */}
                            <div>
                                <label htmlFor="gender" className="block text-sm text-gray-700 mb-1">Giới tính</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    onChange={handleChange}
                                    value={formData.gender}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    required
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="true">Nam</option>
                                    <option value="false">Nữ</option>
                                </select>
                            </div>

                            {/* Các nút */}
                            <div className="col-span-full flex justify-between items-center mt-8">
                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-lg rounded-lg px-15 py-4"
                                    >
                                        Tạo mới
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/staff')}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-15 py-4"
                                    >
                                        Quay về danh sách
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="bg-green-400 hover:bg-green-500 text-white font-semibold text-lg rounded-lg px-15 py-4"
                                >
                                    Tải mẫu file Excel
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="relative text-center font-bold text-gray-500 my-6">
                        <span className="relative z-10 px-3">hoặc</span>
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-300 z-0"></div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <label htmlFor="excelInput" className="flex-1 min-w-[180px] px-15 py-4 text-lg font-bold text-white text-center rounded-md bg-gray-600 hover:bg-gray-700 cursor-pointer">Chọn tệp Excel</label>
                        <input
                            id="excelInput"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => setExcelFile(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                        <button onClick={handleExcelSubmit} className="flex-1 min-w-[180px] px-15 py-4 text-lg font-bold text-white rounded-md bg-blue-600 hover:bg-blue-700 text-center"> Nhập từ Excel</button>
                        {excelFile && <p className="w-full mt-2 text-sm text-center text-gray-600">Tệp đã chọn: {excelFile.name}</p>}
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}

export default AddStaff;