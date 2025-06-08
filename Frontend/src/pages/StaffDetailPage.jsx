import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStaffById } from '../services/staffService';

function StaffDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id;
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    if (!id) {
      navigate('/staff');
      return;
    }

    const fetchStaff = async () => {
      try {
        const data = await getStaffById(id);
        setStaff(data);
      } catch (error) {
        console.error('Lỗi khi tải thông tin nhân viên:', error);
        navigate('/staff');
      }
    };

    fetchStaff();
  }, [id, navigate]);

  if (!staff) {
    return <div className="text-center py-12 text-lg text-gray-600">Đang tải thông tin</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-[#f9f9fb] rounded-xl shadow-md font-sans">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Thông tin chi tiết nhân viên</h2>
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between bg-white px-4 py-2 border border-gray-300 rounded-md">
          <span className="font-semibold text-gray-700">Họ tên:</span><span>{staff.fullName}</span>
        </div>
        <div className="flex justify-between bg-white px-4 py-2 border border-gray-300 rounded-md">
          <span className="font-semibold text-gray-700">Email:</span><span>{staff.email}</span>
        </div>
        <div className="flex justify-between bg-white px-4 py-2 border border-gray-300 rounded-md">
          <span className="font-semibold text-gray-700">Số điện thoại:</span><span>{staff.phone || '-'}</span>
        </div>
        <div className="flex justify-between bg-white px-4 py-2 border border-gray-300 rounded-md">
          <span className="font-semibold text-gray-700">CMND/CCCD:</span><span>{staff.cidNumber}</span>
        </div>
        <div className="flex justify-between bg-white px-4 py-2 border border-gray-300 rounded-md">
          <span className="font-semibold text-gray-700">Ngày sinh:</span><span>{new Date(staff.dob).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between bg-white px-4 py-2 border border-gray-300 rounded-md">
          <span className="font-semibold text-gray-700">Giới tính:</span><span>{staff.gender ? 'Nam' : 'Nữ'}</span>
        </div>
        <div className="flex justify-between bg-white px-4 py-2 border border-gray-300 rounded-md">
          <span className="font-semibold text-gray-700">Địa chỉ:</span><span>{staff.address}</span>
        </div>
        <div className="flex justify-between bg-white px-4 py-2 border border-gray-300 rounded-md">
          <span className="font-semibold text-gray-700">Vai trò:</span><span>{staff.role.toUpperCase()}</span>
        </div>
      </div>
      <button onClick={() => navigate('/staff')} className="block mx-auto bg-gray-600 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded-md">
        Quay về danh sách
      </button>
    </div>
  );
}

export default StaffDetailPage;
