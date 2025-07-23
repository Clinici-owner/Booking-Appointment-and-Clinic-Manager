import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PatientService } from '../services/patientService';
import appointmentService from '../services/appointmentService';
import { MedicalProcessService } from '../services/medicalProcessService';
import { MedicalHistoryService } from '../services/medicalHistoryService';

const PAGE_SIZE = 5;

const PatientMedicalHistoryDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patientId = location.state?.patientId;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [processes, setProcesses] = useState({});
  const [stepHistories, setStepHistories] = useState({});
  // Pagination and filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (patientId) {
      const fetchAll = async () => {
        try {
          const data = await PatientService.getPatientById(patientId);
          setPatient(data);
          const appts = await appointmentService.getAppointmentsByPatient(patientId);
          setAppointments(appts);
          const processMap = {};
          const stepHistoryMap = {};
          await Promise.all(
            appts.map(async (appt) => {
              try {
                const process = await MedicalProcessService.getMedicalProcessByAppointmentId(appt._id);
                processMap[appt._id] = process;
                if (process && process.processSteps) {
                  await Promise.all(
                    process.processSteps.map(async (step) => {
                      try {
                        const historyArr = await MedicalHistoryService.getMedicalHistoryByStepId(step._id);
                        if (Array.isArray(historyArr) && historyArr.length > 0) {
                          stepHistoryMap[step._id] = historyArr[0];
                        } else {
                          stepHistoryMap[step._id] = null;
                        }
                      } catch (err) {
                        console.error(`No medical history found for step ${step._id}:`, err);
                        stepHistoryMap[step._id] = null;
                      }
                    })
                  );
                }
              } catch (err) {
                console.error(`No medical process found for appointment ${appt._id}:`, err);
                processMap[appt._id] = null;
              }
            })
          );
          setProcesses(processMap);
          setStepHistories(stepHistoryMap);
        } catch (err) {
            console.error('Error fetching patient data:', err);
          setPatient(null);
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const displayGender = (gender) => {
    if (gender === true) return 'Nam';
    if (gender === false) return 'Nữ';
    return 'N/A';
  };

  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter(appt => {
      if (startDate && new Date(appt.time) < new Date(startDate)) return false;
      if (endDate && new Date(appt.time) > new Date(endDate)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  const totalPages = Math.ceil(filteredAppointments.length / pageSize);
  const paginatedAppointments = filteredAppointments.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Đang tải dữ liệu...</div>;
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Không tìm thấy thông tin bệnh nhân</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Quay về danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Lịch sử khám bệnh của bệnh nhân</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-100 mb-4">
            <img
              src={patient.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt={patient.fullName || 'Patient'}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }}
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 text-center">{patient.fullName || 'Unknown Name'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <h3 className="text-sm font-medium text-gray-500 col-span-1">Số điện thoại</h3>
              <div className="col-span-2">
                <p className="text-gray-800">{patient.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <h3 className="text-sm font-medium text-gray-500 col-span-1">Ngày sinh</h3>
              <p className="text-gray-800 col-span-2">{formatDate(patient.dob)}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <h3 className="text-sm font-medium text-gray-500 col-span-1">Email</h3>
              <p className="text-gray-800 col-span-2">{patient.email || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <h3 className="text-sm font-medium text-gray-500 col-span-1">CMND/CCCD</h3>
              <div className="col-span-2">
                <p className="text-gray-800">{patient.cidNumber || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <h3 className="text-sm font-medium text-gray-500 col-span-1">Địa chỉ</h3>
              <p className="text-gray-800 col-span-2">{patient.address || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <h3 className="text-sm font-medium text-gray-500 col-span-1">Giới tính</h3>
              <p className="text-gray-800 col-span-2">{displayGender(patient.gender)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Lịch sử khám theo từng lịch hẹn</h2>
        {/* Filter UI */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-gray-600">Từ ngày:</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setPage(1); }}
              className="border rounded px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-gray-600">Đến ngày:</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setPage(1); }}
              className="border rounded px-2 py-1"
            />
          </div>
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
        {filteredAppointments.length > 0 ? (
          <div className="space-y-6">
            {paginatedAppointments.map((appt) => {
              const process = processes[appt._id];
              return (
                <div key={appt._id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="mb-2">
                    <span className="font-semibold text-blue-700">Ngày hẹn:</span> {formatDate(appt.time)}<br />
                    <span className="font-semibold text-blue-700">Bác sĩ:</span> {appt.doctorId?.fullName || 'N/A'}<br />
                    <span className="font-semibold text-blue-700">Chuyên khoa:</span> {appt.specialties?.[0]?.specialtyName || 'N/A'}<br />
                    <span className="font-semibold text-blue-700">Gói khám:</span> {appt.healthPackage?.packageName || 'Không'}
                  </div>
                  {process ? (
                    <div className="ml-2">
                      <div className="font-medium text-gray-800 mb-1">Các bước thực hiện:</div>
                      <div className="space-y-2">
                        {process.processSteps && process.processSteps.length > 0 ? (
                          process.processSteps.map((step, sidx) => (
                            <div key={step._id} className="border rounded p-2 bg-gray-50">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <span className="font-semibold">Bước {sidx + 1}:</span> {step.serviceId?.paraclinalName || 'N/A'}<br />
                                  <span className="text-sm text-gray-600">Phòng: {step.serviceId?.room?.roomNumber || 'N/A'} - {step.serviceId?.room?.roomName || ''}</span><br />
                                  <span className="text-sm text-gray-600">Ghi chú: {step.notes || 'Không có'}</span>
                                </div>
                                <div className="mt-2 md:mt-0">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${step.isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {step.isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                                  </span>
                                </div>
                              </div>
                              {/* Kết quả cận lâm sàng nếu có */}
                              {/* Hiển thị kết quả từ medicalHistory nếu có */}
                              {stepHistories[step._id] && stepHistories[step._id].resultFiles && stepHistories[step._id].resultFiles.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-gray-700 font-medium">Kết quả cận lâm sàng:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {stepHistories[step._id].resultFiles.map((file, fidx) => (
                                      <div key={fidx} className="flex flex-col items-center mr-4 mb-2">
                                        <a href={file.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline mb-1">
                                          Xem kết quả {fidx + 1}
                                        </a>
                                        {file.file_path && (/(.jpg|.jpeg|.png|.gif|.bmp|.webp)$/i).test(file.file_path) && (
                                          <img
                                            src={file.file_path}
                                            alt={`Kết quả ${fidx + 1}`}
                                            className="w-32 h-32 object-cover rounded border shadow"
                                            style={{ maxWidth: 128, maxHeight: 128 }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">Không có bước nào</div>
                        )}
                      </div>
                      {process.finalResult && (
                        <div className="mt-2 text-green-700 font-semibold">Kết luận cuối cùng: {process.finalResult}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">Chưa có quy trình khám cho lịch hẹn này</div>
                  )}
                </div>
              );
            })}
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
        ) : (
          <p className="text-gray-500">Không có lịch sử khám bệnh</p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Quay về danh sách
        </button>
      </div>
    </div>
  );
};

export default PatientMedicalHistoryDetailPage;
