"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { getAllSpecialties } from "../services/specialtyService";
import { DoctorService } from "../services/doctorService";
import { getSchedulesBySpecialtyAndDate } from "../services/scheduleService";
import appointmentService from "../services/appointmentService";
import { PatientService } from "../services/patientService";
import BannerName from "../components/BannerName";
import SpecialtiesCard from "../components/SpecialtyCard";

function AppointmentBookingPage() {
  // Lấy user hiện tại (nhân viên y tế đang đăng ký cho bệnh nhân)
  const currentUser = JSON.parse(sessionStorage.getItem("user") || "null");

  // Lấy patientId từ nhiều nguồn khác nhau
  const { patientId: paramPatientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Debug logging
  console.log("URL Params patientId:", paramPatientId);
  console.log("Location state:", location.state);
  console.log("Location pathname:", location.pathname);

  // Thử lấy patientId từ nhiều nguồn
  const targetPatientId =
    paramPatientId ||
    location.state?.patientId ||
    location.state?.id ||
    new URLSearchParams(location.search).get("patientId");

  console.log("Final targetPatientId:", targetPatientId);

  // Thêm state cho manual input
  const [manualPatientId, setManualPatientId] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedTime, setSelectedTime] = useState({
    scheduleId: null,
    timeRange: null,
  });
  const [schedules, setSchedules] = useState([]);
  const [scheduleByDoctor, setScheduleByDoctor] = useState([]);
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [symptoms, setSymptoms] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [listTimeAppointment, setListTimeAppointment] = useState([]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const typeAppointment = location.state?.typeAppointment || "specialty";
  const packageId = location.state?.healthPackageId || null;

  // Lấy thông tin bệnh nhân theo ID
  const getPatientInfo = useCallback(async (id) => {
    try {
      setLoadingPatient(true);
      setError("");
      const response = await PatientService.getPatientById(id);
      setPatientInfo(response);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin bệnh nhân:", error);
      setError("Không thể tải thông tin bệnh nhân. Vui lòng thử lại.");
    } finally {
      setLoadingPatient(false);
    }
  }, []);

  const fetchSpecialties = useCallback(async () => {
    try {
      const response = await getAllSpecialties();
      setSpecialties(response);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", err);
      setError("Không thể tải danh sách chuyên khoa.");
    }
  }, []);

  const fetchAppointment = useCallback(async () => {
    try {
      if (!selectedSpecialty) return;

      const response = await appointmentService.getAppointmentsBySpecialty(
        selectedSpecialty._id
      );
      const list = response.map((appointment) => {
        const utcDate = new Date(appointment.time);
        utcDate.setHours(utcDate.getHours() - 7);
        const hour = String(utcDate.getHours()).padStart(2, "0");
        const minute = String(utcDate.getMinutes()).padStart(2, "0");
        const date = utcDate.toISOString().split("T")[0];
        return {
          timeAppointment: `${hour}:${minute}`,
          doctorId: appointment.doctorId._id,
          dateAppointment: date,
        };
      });
      setListTimeAppointment(list);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin lịch hẹn:", error);
    }
  }, [selectedSpecialty]);

  // Effects
  useEffect(() => {
    if (targetPatientId) {
      getPatientInfo(targetPatientId);
    }
  }, [targetPatientId, getPatientInfo]);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  // Utility functions
  const generateTimeRanges = useCallback(
    (start, end, stepMinutes, doctorId, scheduleDate, list) => {
      const result = [];
      let [hour, minute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);
      const formatted = new Date(scheduleDate).toISOString().split("T")[0];

      while (hour < endHour || (hour === endHour && minute < endMinute)) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const isBooked = list.some(
          (item) =>
            item.doctorId === doctorId &&
            item.dateAppointment === formatted &&
            item.timeAppointment === startTime
        );

        if (!isBooked) {
          result.push(startTime);
        }

        minute += stepMinutes;
        if (minute >= 60) {
          hour++;
          minute %= 60;
        }
      }
      return result;
    },
    []
  );

  const formatVietnameseDate = useCallback((dateStr) => {
    const date = new Date(dateStr);
    const weekdays = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return `${weekdays[date.getDay()]}, Ngày ${date.getDate()} Tháng ${
      date.getMonth() + 1
    } Năm ${date.getFullYear()}`;
  }, []);

  // Event handlers
  const handleSelectSpecialty = useCallback(async (specialty) => {
    setSelectedSpecialty(specialty);
    setSelectedDoctorId(null);
    setScheduleByDoctor([]);
    setSelectedTime({ scheduleId: null, timeRange: null });

    try {
      const doctorsResponse = await DoctorService.getDoctorsBySpecialty(
        specialty._id
      );

      // lấy danh sách bác sĩ với vai trò là 'doctor'
      const filteredDoctors = doctorsResponse.filter(
        (doc) => doc.doctorId.role === "doctor"
      );
      if (filteredDoctors.length === 0) {
        setError("Không tìm thấy bác sĩ cho chuyên khoa này.");
        return;
      }
      setDoctors(filteredDoctors);

      const schedulesResponse = await getSchedulesBySpecialtyAndDate(
        specialty._id,
        new Date().toISOString().split("T")[0]
      );
      setSchedules(schedulesResponse);
      setStep(2);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
      setError("Không thể tải danh sách bác sĩ.");
    }
  }, []);

  const selectDoctor = useCallback(
    (doctorId) => {
      setSelectedDoctorId(doctorId);
      const matched = schedules.filter(
        (schedule) => schedule.userId._id === doctorId
      );
      setScheduleByDoctor(matched);
      setStep(3);
    },
    [schedules]
  );

  const selectTime = useCallback((scheduleId, timeRange) => {
    setSelectedTime({ scheduleId, timeRange });
  }, []);

  const toggleSchedule = useCallback((id) => {
    setExpandedSchedules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const goBack = useCallback(() => {
    if (step === 3) {
      setStep(2);
      setSelectedTime({ scheduleId: null, timeRange: null });
      setScheduleByDoctor([]);
    } else if (step === 2) {
      setStep(1);
      setSelectedDoctorId(null);
      setDoctors([]);
      setSchedules([]);
    }
  }, [step]);

  const handleBooking = useCallback(() => {
    if (
      !selectedDoctorId ||
      !selectedTime?.scheduleId ||
      !selectedTime?.timeRange
    ) {
      alert("Vui lòng chọn đầy đủ bác sĩ và thời gian khám");
      return;
    }

    navigate("/appointment-payment", {
      state: {
        user: patientInfo,
        doctorId: selectedDoctorId,
        scheduleId: selectedTime.scheduleId,
        timeRange: selectedTime.timeRange,
        symptoms: symptoms,
        specialtyId: selectedSpecialty._id,
        typeAppointment: typeAppointment,
        packageId: packageId,
        isStaffBooking: true, // Đánh dấu đây là đặt lịch bởi nhân viên
      },
      replace: true,
    });
  }, [
    selectedDoctorId,
    selectedTime,
    symptoms,
    selectedSpecialty,
    typeAppointment,
    packageId,
    patientInfo,
    navigate,
  ]);

  const handleSymptomsChange = useCallback((e) => {
    setSymptoms(e.target.value);
  }, []);

  const goBackToPatientList = useCallback(() => {
    navigate("/receptionist/patients", { replace: true });
  }, [navigate]);

  // Thêm function để handle manual input
  const handleManualPatientIdSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (manualPatientId.trim()) {
        // Update URL và state
        navigate(`/patient-appointment/${manualPatientId.trim()}`, {
          replace: true,
        });
        window.location.reload(); // Force reload để trigger useEffect
      }
    },
    [manualPatientId, navigate]
  );

  // Render conditions
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Bạn chưa đăng nhập
          </h2>
          <Link
            to="/login"
            className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (!targetPatientId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Không tìm thấy ID bệnh nhân
          </h2>

          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Debug Info:</p>
            <p className="text-xs text-gray-500">
              URL Params: {paramPatientId || "null"}
            </p>
            <p className="text-xs text-gray-500">
              State: {JSON.stringify(location.state)}
            </p>
          </div>

          {!showManualInput ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowManualInput(true)}
                className="w-full px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300"
              >
                Nhập ID bệnh nhân thủ công
              </button>
              <button
                type="button"
                onClick={goBackToPatientList}
                className="w-full px-6 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-300"
              >
                Quay lại danh sách bệnh nhân
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualPatientIdSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Bệnh nhân
                </label>
                <input
                  type="text"
                  value={manualPatientId}
                  onChange={(e) => setManualPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập ID bệnh nhân..."
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300"
                >
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Đang tải thông tin bệnh nhân...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-semibold text-red-600 mb-4">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={goBackToPatientList}
            className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300"
          >
            Quay lại danh sách bệnh nhân
          </button>
        </div>
      </div>
    );
  }

  if (!patientInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Không tìm thấy thông tin bệnh nhân
          </h2>
          <button
            type="button"
            onClick={goBackToPatientList}
            className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300"
          >
            Quay lại danh sách bệnh nhân
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BannerName Text="Đăng ký khám bệnh cho bệnh nhân" />
      <div className="container mx-auto px-4 py-12">
        {/* Nút quay lại danh sách bệnh nhân */}
        <div className="mb-6">
          <button
            type="button"
            onClick={goBackToPatientList}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại danh sách bệnh nhân
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10">
          {/* Phần thông tin bệnh nhân */}
          <div className="bg-blue-50 rounded-2xl shadow-xl p-8 border border-gray-100 h-fit">
            <h2 className="text-3xl font-bold text-blue-600 mb-6">
              Thông tin bệnh nhân
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-blue-600">Mã BN:</span>
                <span className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">
                  {patientInfo._id}
                </span>
              </div>
              <p>
                <span className="font-medium text-blue-600">Họ và tên:</span>{" "}
                {patientInfo.fullName}
              </p>
              <p>
                <span className="font-medium text-blue-600">Ngày sinh:</span>{" "}
                {new Date(patientInfo.dob).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <span className="font-medium text-blue-600">Giới tính:</span>{" "}
                {patientInfo.gender ? "Nam" : "Nữ"}
              </p>
              <p>
                <span className="font-medium text-blue-600">
                  Số điện thoại:
                </span>{" "}
                {patientInfo.phone}
              </p>
              <p>
                <span className="font-medium text-blue-600">Email:</span>{" "}
                {patientInfo.email}
              </p>
              <p>
                <span className="font-medium text-blue-600">Địa chỉ:</span>{" "}
                {patientInfo.address}
              </p>
              {patientInfo.cidNumber && (
                <p>
                  <span className="font-medium text-blue-600">CCCD/CMND:</span>{" "}
                  {patientInfo.cidNumber}
                </p>
              )}
            </div>
          </div>

          {/* Phần đăng ký khám bệnh */}
          <div className="bg-blue-50 rounded-2xl shadow-xl p-8">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay lại
              </button>
            )}

            {/* Progress indicator */}
            <div className="flex items-center mb-6">
              <div
                className={`flex items-center ${
                  step >= 1 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300"
                  }`}
                >
                  1
                </div>
                <span className="ml-2 font-medium">Chuyên khoa</span>
              </div>
              <div
                className={`flex-1 h-1 mx-4 ${
                  step >= 2 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`flex items-center ${
                  step >= 2 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300"
                  }`}
                >
                  2
                </div>
                <span className="ml-2 font-medium">Bác sĩ</span>
              </div>
              <div
                className={`flex-1 h-1 mx-4 ${
                  step >= 3 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`flex items-center ${
                  step >= 3 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 3 ? "bg-blue-600 text-white" : "bg-gray-300"
                  }`}
                >
                  3
                </div>
                <span className="ml-2 font-medium">Thời gian</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-blue-600 mb-6">
              {step === 1
                ? "Chọn chuyên khoa khám"
                : step === 2
                ? `Chọn bác sĩ - ${selectedSpecialty?.specialtyName}`
                : "Chọn thời gian khám"}
            </h2>

            {/* Bước 1: Chọn chuyên khoa */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialties.map((specialty) => (
                  <SpecialtiesCard
                    key={specialty._id}
                    id={specialty._id}
                    name={specialty.specialtyName}
                    description={specialty.descspecialty}
                    logo={specialty.logo}
                    showDetailButton={false} // Ẩn nút "Xem chi tiết"
                    onClick={() => handleSelectSpecialty(specialty)} // Thêm onClick handler
                  />
                ))}
              </div>
            )}

            {/* Bước 2: Chọn bác sĩ */}
            {step === 2 && (
              <div>
                {doctors.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">
                      Không có bác sĩ nào trong chuyên khoa này.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.doctorId._id}
                        onClick={() => selectDoctor(doctor.doctorId._id)}
                        className={`bg-white rounded-2xl p-6 border cursor-pointer transition-all hover:shadow-md hover:scale-105 ${
                          selectedDoctorId === doctor.doctorId._id
                            ? "ring-2 ring-blue-500 shadow-lg"
                            : ""
                        }`}
                      >
                        <img
                          src={
                            doctor.doctorId.avatar ||
                            "/placeholder.svg?height=96&width=96&query=doctor+avatar"
                          }
                          alt={doctor.doctorId.fullName}
                          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                        />
                        <h5 className="text-center font-semibold text-blue-600 text-lg">
                          BS. {doctor.doctorId.fullName}
                        </h5>
                        {doctor.doctorId.experience && (
                          <p className="text-center text-gray-500 text-sm mt-2">
                            {doctor.doctorId.experience} năm kinh nghiệm
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bước 3: Chọn thời gian */}
            {step === 3 && (
              <div>
                {scheduleByDoctor.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">
                      Bác sĩ này hiện không có lịch khám.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {scheduleByDoctor.map((schedule) => (
                      <div
                        key={schedule._id}
                        className="p-6 bg-white rounded-xl border hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-medium text-lg">
                            {formatVietnameseDate(schedule.date)}
                          </span>
                          <span
                            className={`px-3 py-1 text-sm rounded-full font-medium ${
                              schedule.shift === "MORNING"
                                ? "bg-green-100 text-green-800"
                                : schedule.shift === "NOON"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {schedule.shift === "MORNING"
                              ? "Buổi sáng (7:00 - 10:30)"
                              : schedule.shift === "NOON"
                              ? "Buổi trưa (11:30 - 13:00)"
                              : "Buổi chiều (13:30 - 16:30)"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSchedule(schedule._id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {expandedSchedules[schedule._id]
                            ? "Ẩn khung giờ"
                            : "Xem khung giờ có sẵn"}
                        </button>
                        {expandedSchedules[schedule._id] && (
                          <div className="grid grid-cols-4 gap-3 mt-4">
                            {generateTimeRanges(
                              schedule.shift === "MORNING"
                                ? "07:00"
                                : schedule.shift === "NOON"
                                ? "11:30"
                                : "13:30",
                              schedule.shift === "MORNING"
                                ? "10:30"
                                : schedule.shift === "NOON"
                                ? "13:00"
                                : "16:30",
                              30,
                              schedule.userId._id,
                              schedule.date,
                              listTimeAppointment
                            ).map((range, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => selectTime(schedule._id, range)}
                                className={`border rounded-lg py-3 px-4 text-sm font-medium transition-colors ${
                                  selectedTime.scheduleId === schedule._id &&
                                  selectedTime.timeRange === range
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "hover:bg-blue-50 hover:border-blue-300"
                                }`}
                              >
                                {range}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả triệu chứng và lý do khám
                  </label>
                  <textarea
                    rows={4}
                    value={symptoms}
                    onChange={handleSymptomsChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập triệu chứng, lý do khám bệnh..."
                  />
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={!selectedTime.scheduleId}
                    className={`px-8 py-3 text-white rounded-lg font-medium transition-colors ${
                      selectedTime.scheduleId
                        ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Đăng ký khám bệnh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentBookingPage;
