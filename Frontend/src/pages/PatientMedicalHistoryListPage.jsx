import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientService } from '../services/patientService';

const PatientMedicalHistoryListPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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

  // Lọc danh sách bệnh nhân theo tên
  const filteredPatients = patients.filter((patient) =>
    patient.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Danh sách bệnh nhân</h1>
      <div className="flex justify-end mb-4">
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Tìm kiếm theo tên bệnh nhân..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
              {filteredPatients.map((patient) => (
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
        </div>
      )}
    </div>
  );
};

export default PatientMedicalHistoryListPage;
