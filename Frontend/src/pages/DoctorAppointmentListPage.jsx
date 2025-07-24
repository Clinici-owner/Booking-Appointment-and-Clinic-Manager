import { useEffect, useState } from 'react';
import { Toaster, toast } from "sonner";
import socket from '../lib/socket';
import appointmentService from '../services/appointmentService';

const DoctorAppointmentListPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  // Pagination states
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  let user = null;
  try {
    const raw = sessionStorage.getItem('user');
    user = raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('❌ Lỗi khi lấy user từ sessionStorage:', err);
  }

 useEffect(() => {
  const fetchAppointments = async () => {
    try {
      console.log('🔁 Fetching all appointments...');
      const allAppointments = await appointmentService.getAppointments();

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const filtered = allAppointments.filter(
        (a) =>
          a.status === 'confirmed' &&
          a.doctorId?._id === user._id &&
          new Date(a.time) >= startOfDay &&
          new Date(a.time) <= endOfDay
      );

      setAppointments(filtered);
    } catch (err) {
      console.error('Lỗi lấy lịch hẹn:', err);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  if (user?._id && !hasFetched) {
    socket.emit('register', user._id);
    fetchAppointments();
  }
}, [user, hasFetched]);

  const handleInvite = (appointment) => {
    const patientId = appointment.patientId?._id;
    if (!patientId) return;

    socket.emit('invite_patient', { userId: patientId });

    toast.success(`📨 Đã mời bệnh nhân ${appointment.patientId.fullName} vào phòng`, {
      description: `Thời gian: ${new Date().toLocaleTimeString('vi-VN')}`,
      duration: 3000,
    });
  };

  const filteredAppointments = appointments.filter((appt) =>
    appt.patientId?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / pageSize);
  const paginatedAppointments = filteredAppointments.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Toaster position="top-right" richColors />
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Danh sách lịch hẹn đã xác nhận
      </h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Tìm kiếm theo tên bệnh nhân..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="page-size" className="text-gray-600">Số lịch/trang:</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Đang tải danh sách lịch hẹn...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center text-gray-500">Không có lịch hẹn nào</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chuyên khoa</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mời</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedAppointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-blue-50">
                  <td className="px-4 py-2">
                    <img
                      src={
                        appt.patientId?.avatar ||
                        'https://randomuser.me/api/portraits/men/32.jpg'
                      }
                      alt={appt.patientId?.fullName}
                      className="w-10 h-10 rounded-full object-cover border"
                      onError={(e) => {
                        e.target.src =
                          'https://randomuser.me/api/portraits/men/32.jpg';
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">{appt.patientId?.fullName}</td>
                  <td className="px-4 py-2">{appt.patientId?.email || 'N/A'}</td>
                  <td className="px-4 py-2">{appt.patientId?.phone}</td>
                  <td className="px-4 py-2">
                    {new Date(appt.time).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-2">
                    {appt.specialties?.[0]?.specialtyName || '---'}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => handleInvite(appt)}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-semibold"
                    >
                      Mời bệnh nhân
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="font-medium">Trang {page} / {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentListPage;
