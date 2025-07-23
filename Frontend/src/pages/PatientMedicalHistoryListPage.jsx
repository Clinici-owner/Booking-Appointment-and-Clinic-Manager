import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '../services/patientService';

const PatientMedicalHistoryListPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  // Pagination and filter states
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await PatientService.getAllPatients();
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handlePatientClick = (patientId) => {
    navigate('/doctor/patient-medical-history', { state: { patientId } });
  };

  // Lọc danh sách bệnh nhân theo tên và ngày sinh
  const filteredPatients = patients.filter((patient) => {
    const nameMatch = patient.fullName?.toLowerCase().includes(search.toLowerCase());
    let dobMatch = true;
    if (startDate && (!patient.dob || new Date(patient.dob) < new Date(startDate))) dobMatch = false;
    if (endDate && (!patient.dob || new Date(patient.dob) > new Date(endDate))) dobMatch = false;
    return nameMatch && dobMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Danh sách bệnh nhân</h1>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Tìm kiếm theo tên bệnh nhân..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="start-date" className="text-gray-600">Ngày sinh từ:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1); }}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="end-date" className="text-gray-600">Đến:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1); }}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="page-size" className="text-gray-600">Số bệnh nhân/trang:</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border rounded px-2 py-1"
          >
            {[10, 20, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-center">Đang tải danh sách bệnh nhân...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center text-gray-500">Không có bệnh nhân nào</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số điện thoại</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-blue-50 cursor-pointer" onClick={() => handlePatientClick(patient._id)}>
                  <td className="px-4 py-2">
                    <img
                      src={patient.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
                      alt={patient.fullName || 'avatar'}
                      className="w-10 h-10 rounded-full object-cover border"
                      onError={e => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }}
                    />
                  </td>
                  <td className="px-4 py-2">{patient.fullName}</td>
                  <td className="px-4 py-2">{patient.email || 'N/A'}</td>
                  <td className="px-4 py-2">{patient.phone}</td>
                  <td className="px-4 py-2">{patient.dob ? new Date(patient.dob).toLocaleDateString('vi-VN') : 'N/A'}</td>
                  <td className="px-4 py-2 text-blue-600">Xem lịch sử</td>
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

export default PatientMedicalHistoryListPage;
