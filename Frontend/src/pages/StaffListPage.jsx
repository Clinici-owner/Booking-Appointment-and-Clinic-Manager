// src/pages/StaffList.jsx
import { useEffect, useState } from 'react';
import { listStaff, lockStaff } from '../services/staffService';
import { useNavigate } from 'react-router-dom';

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

  const handleLock = async (id) => {
    try {
      await lockStaff(id);
      fetchStaff();
    } catch (error) {
      console.error('Lỗi khi khóa tài khoản:', error);
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
    <div className="staff-list-container">
      <h2 className="title">Quản lý nhân viên</h2>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Tìm theo tên..."
          value={searchName}
          onChange={handleSearchChange}
        />

        <select value={filterRole} onChange={handleFilterChange}>
          <option value="">Tất cả vai trò</option>
          <option value="doctor">Bác sĩ</option>
          <option value="technician">Kỹ thuật viên</option>
          <option value="receptionist">Lễ tân</option>
          <option value="admin">Quản trị viên</option>
        </select>

        <button className="btn green" onClick={() => navigate('/staff/add')}>
          + Tạo nhân viên mới
        </button>
      </div>

      <table className="staff-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Hành động</th>
            <th>Chi tiết</th>
            <th>Chỉnh sửa</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaff.length > 0 ? (
            filteredStaff.map((staff, index) => (
              <tr key={staff._id}>
                <td>{index + 1}</td>
                <td>{staff.fullName}</td>
                <td>{staff.email}</td>
                <td>{staff.phone || '-'}</td>
                <td>{staff.role}</td>
                <td>
                  <button className="btn red" onClick={() => handleLock(staff._id)}>Khóa</button>
                </td>
                <td>
                  <button className="btn blue" onClick={() => navigate(`/staff/${staff._id}`)}>Xem</button>
                </td>
                <td>
                  <button className="btn orange" onClick={() => navigate(`/staff/update/${staff._id}`)}>Sửa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">Không tìm thấy nhân viên phù hợp.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StaffList;