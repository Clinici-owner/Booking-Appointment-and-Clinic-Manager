import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStaff, toggleLockStatus } from '../services/staffService';
import AdminNavSidebar from '../components/AdminNavSidebar';

function StaffList() {
  const [staffList, setStaffList] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await listStaff();
      setStaffList(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhân viên:', error);
    }
  };

  const handleLock = async (id, currentStatus) => {
    try {
      const res = await toggleLockStatus(id, currentStatus);
      if (res?.user?.status) {
        setStaffList(prev =>
          prev.map(staff =>
            staff._id === id ? { ...staff, status: res.user.status } : staff
          )
        );
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái tài khoản:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
  };

  const filteredStaff = staffList.filter((staff) => {
    return (
      staff.fullName.toLowerCase().includes(searchName.toLowerCase()) &&
      (filterRole === '' || staff.role === filterRole)
    );
  });

  return (
    <div className="flex">
      <AdminNavSidebar />

      <div className="max-w-[1200px] mx-auto p-8 font-sans w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Quản lý nhân viên</h2>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Tìm theo tên..."
            value={searchName}
            onChange={handleSearchChange}
            className="flex-[1.5] min-w-[220px] px-3 py-2 text-sm border border-gray-300 rounded-md"
          />

          <select
            value={filterRole}
            onChange={handleFilterChange}
            className="flex-1 min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="">Tất cả vai trò</option>
            <option value="doctor">Bác sĩ</option>
            <option value="technician">Kỹ thuật viên</option>
            <option value="receptionist">Lễ tân</option>
            <option value="admin">Quản trị viên</option>
          </select>

          <button
            onClick={() => navigate('/staff/add')}
            className="whitespace-nowrap px-4 py-2 text-sm font-bold text-white rounded-md bg-green-600 hover:bg-green-700"
          >
            Tạo nhân viên mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-3 text-center font-semibold whitespace-nowrap">STT</th>
                <th className="p-3 text-center font-semibold w-[220px] whitespace-nowrap">Họ và tên</th>
                <th className="p-3 text-center font-semibold w-[220px] whitespace-nowrap">Email</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap">Số điện thoại</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap">Vai trò</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap">Hành động</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap">Chi tiết</th>
                <th className="p-3 text-center font-semibold whitespace-nowrap">Chỉnh sửa</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <tr key={staff._id} className="text-sm text-gray-700 border-b">
                    <td className="p-3 text-center whitespace-nowrap">{index + 1}</td>
                    <td className="p-3 text-center whitespace-nowrap overflow-hidden text-ellipsis">{staff.fullName}</td>
                    <td className="p-3 text-center whitespace-nowrap overflow-hidden text-ellipsis">{staff.email}</td>
                    <td className="p-3 text-center whitespace-nowrap">{staff.phone || '-'}</td>
                    <td className="p-3 text-center uppercase whitespace-nowrap">{staff.role}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        className={`px-3 py-1 text-sm font-bold text-white rounded-md ${staff.status === 'locked' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
                        onClick={() => handleLock(staff._id, staff.status)}
                      >
                        {staff.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        className="px-3 py-1 text-sm font-bold text-white rounded-md bg-blue-500 hover:bg-blue-600"
                        onClick={() => navigate('/staff/detail', { state: { id: staff._id } })}
                      >
                        Xem
                      </button>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        className="px-3 py-1 text-sm font-bold text-white rounded-md bg-orange-500 hover:bg-orange-600"
                        onClick={() => navigate('/staff/update', { state: { id: staff._id } })}
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-sm text-gray-500">Không tìm thấy nhân viên phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StaffList;
