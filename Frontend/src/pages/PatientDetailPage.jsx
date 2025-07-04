import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PatientService } from '../services/patientService';
import { MedicalHistoryService } from '../services/medicalHistoryService';

const PatientDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [medicalHistory, setMedicalHistory] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const patientId = location.state?.patientId;

  useEffect(() => {
    if (patientId) {
      const fetchPatientData = async () => {
        try {
          const data = await PatientService.getPatientById(patientId);
          setPatient(data);
          const history = await MedicalHistoryService.getMedicalHistoryByPatientId(patientId);
          setMedicalHistory(history);         
        } catch (err) {
          console.error("Error fetching patient data:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchPatientData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString; // Return original if can't parse
    }
  };

  // Function to display gender
  const displayGender = (gender) => {
    if (gender === true) return 'Nam';
    if (gender === false) return 'Nữ';
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading patient data...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>No patient data found</p>
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Thông tin chi tiết bệnh nhân
      </h1>

      {/* Patient Information Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col items-center mb-6">
          {/* Avatar Image with fallback */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-100 mb-4">
            <img
              src={patient.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt={`${patient.fullName || 'Patient'}'s avatar`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://randomuser.me/api/portraits/men/32.jpg";
              }}
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 text-center">
            {patient.fullName || 'Unknown Name'}
          </h2>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
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

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <h3 className="text-sm font-medium text-gray-500 col-span-1">CMND/CCCD</h3>
              <div className="col-span-2">
                <p className="text-gray-800">
                  {patient.cidNumber || 'N/A'}
                </p>
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

      {/* Medical History Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Lịch sử khám</h2>

        {medicalHistory.length > 0 ? (
          <div className="space-y-4">
            {medicalHistory.map((record, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium text-gray-800">Ngày khám: {formatDate(record.createdAt)}</p>
                <p className="text-gray-700">Chuẩn đoán: {record.processStep.notes || 'N/A'}</p>

                {/* Services Section */}
                <div className="mt-2">
                  <p className="text-gray-700 font-medium">Dịch vụ: {record.processStep.serviceId.paraclinalName}</p>
                </div>

                {/* Results Section */}
                {record.resultFiles && record.resultFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-gray-700 font-medium">Kết quả cận lâm sàng:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {record.resultFiles.map((result, resultIndex) => (
                        <a
                          key={resultIndex}
                          href={result.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          Xem kết quả {resultIndex + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-2">Bác sĩ: Bs. {record.doctorId?.fullName || 'N/A'}</p>
                <p className="text-sm text-gray-500">Trạng thái:
                  <span className={`ml-1 ${record.status === 'complete' ? 'text-green-500' :
                      record.status === 'pending' ? 'text-yellow-500' :
                        'text-gray-500'
                    }`}>
                    {record.status === 'complete' ? 'Hoàn thành' :
                      record.status === 'pending' ? 'Đang chờ' :
                        record.status || 'N/A'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Không có lịch sử khám bệnh</p>
        )}
      </div>

      {/* Back Button */}
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

export default PatientDetail;