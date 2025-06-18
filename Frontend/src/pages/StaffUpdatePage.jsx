import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header'; 
import AdminNavSidebar from '../components/AdminNavSidebar'; 
import { getStaffById, updateStaff } from '../services/staffService';

function UpdateStaff() {
    const location = useLocation();
    const navigate = useNavigate();
    const staffId = location.state?.id;
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);     
    const [notification, setNotification] = useState(null); 

    useEffect(() => {
        if (!staffId) {
            console.warn('Không tìm thấy ID nhân viên trong location state. Điều hướng về trang danh sách.');
            navigate('/staffs');
            return;
        }

        async function fetchStaff() {
            try {
                setLoading(true); // Bắt đầu tải dữ liệu
                const data = await getStaffById(staffId);
                setStaff(data);
            } catch (error) {
                console.error('Lỗi khi tải nhân viên:', error);
                setError('Không tìm thấy thông tin nhân viên hoặc có lỗi xảy ra.'); // Cập nhật lỗi
            } finally {
                setLoading(false); // Kết thúc tải dữ liệu
            }
        }
        fetchStaff();
    }, [staffId, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // Xử lý giới tính đặc biệt vì nó là boolean
        if (name === 'gender') {
            setStaff({
                ...staff,
                [name]: value === 'true' // Chuyển 'true'/'false' string sang boolean
            });
        } else {
            setStaff({
                ...staff,
                [name]: type === 'checkbox' ? checked : value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification(null); // Xóa thông báo cũ
        try {
            await updateStaff(staffId, staff);
            setNotification('Đã cập nhật thông tin cá nhân thành công!');
            // Clear notification after 3 seconds
            setTimeout(() => setNotification(null), 2000);
            // Sau khi cập nhật thành công, có thể quay lại trang chi tiết hoặc danh sách
            setTimeout(() => navigate('/staffs'), 2000); // Chuyển hướng sau 3 giây
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            // Cố gắng lấy thông báo lỗi từ server nếu có
            const errorMessage = error.response?.data?.message || 'Cập nhật thất bại!';
            setNotification(errorMessage);
            setTimeout(() => setNotification(null), 3000); // Clear error notification after 3 seconds
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="flex bg-[#F3F6F9] min-h-screen">
                <AdminNavSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Header />
                    <div className="text-center py-15 text-xl text-gray-600">Đang tải thông tin...</div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex bg-[#F3F6F9] min-h-screen">
                <AdminNavSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Header />
                    <div className="text-center py-15 text-xl text-red-500">{error}</div>
                    <button
                        onClick={() => navigate('/staffs')}
                        className="mt-5 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-12 py-4"
                    >
                        Quay về danh sách
                    </button>
                </div>
            </div>
        );
    }

    // Don't render if staff is null after loading and no error
    if (!staff) {
        return null;
    }

    return (
        <div className="flex bg-[#F3F6F9] min-h-screen">
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex">
                    <AdminNavSidebar />
                <div className="w-full max-w-6xl mx-auto p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-5">
                        <h2 className="text-[#212B36] font-bold text-4xl leading-7">
                            Cập nhật thông tin nhân viên
                        </h2>
                    </div>

                    {/* Success Notification */}
                    {notification && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-5 py-4 rounded-lg mb-8 text-center">
                            {notification}
                        </div>
                    )}

                    <div className="bg-white rounded-lg border border-[#D9D9D9] p-8">
                        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-15 gap-y-8">
                            {/* Họ và tên */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm text-gray-700 mb-2">Họ và tên</label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={staff.fullName || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm text-gray-700 mb-2">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={staff.email || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            {/* Số điện thoại */}
                            <div>
                                <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">Số điện thoại</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={staff.phone || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            {/* CMND/CCCD - Trường này không có trong HTML mẫu, nhưng tôi giữ lại từ StaffDetailPage nếu bạn muốn thêm */}
                            <div>
                                <label htmlFor="cidNumber" className="block text-sm text-gray-700 mb-2">CMND/CCCD</label>
                                <input
                                    id="cidNumber"
                                    name="cidNumber"
                                    type="text"
                                    value={staff.cidNumber || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            {/* Ngày sinh - Trường này không có trong HTML mẫu, nhưng tôi giữ lại từ StaffDetailPage nếu bạn muốn thêm */}
                            <div>
                                <label htmlFor="dob" className="block text-sm text-gray-700 mb-2">Ngày sinh</label>
                                <input
                                    id="dob"
                                    name="dob"
                                    type="date" // Sử dụng type="date" để dễ chọn ngày
                                    value={staff.dob ? new Date(staff.dob).toISOString().split('T')[0] : ''}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            {/* Địa chỉ */}
                            <div>
                                <label htmlFor="address" className="block text-sm text-gray-700 mb-2">Địa chỉ</label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={staff.address || ''}
                                    onChange={handleChange}
                                    placeholder="Địa chỉ"
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            {/* Vai trò */}
                            <div>
                                <label htmlFor="role" className="block text-sm text-gray-700 mb-2">Vai trò</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={staff.role || ''}
                                    onChange={handleChange}
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
                                <label htmlFor="gender" className="block text-sm text-gray-700 mb-2">Giới tính</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={staff.gender === true ? 'true' : 'false'} // Chuyển boolean sang string để gán vào value của select
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="true">Nam</option>
                                    <option value="false">Nữ</option>
                                </select>
                            </div>

                            {/* Các nút */}
                            <div className="col-span-full flex justify-center space-x-4 mt-10">
                                <button
                                    type="submit"
                                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-lg rounded-lg px-15 py-4"
                                >
                                    Cập nhật
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-15 py-4"
                                    onClick={() => navigate('/staffs')}
                                >
                                    Quay về danh sách
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateStaff;