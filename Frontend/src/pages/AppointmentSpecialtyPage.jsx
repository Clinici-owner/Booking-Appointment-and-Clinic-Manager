import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { getSpecialtyById } from "../services/specialtyService";
import { DoctorService } from "../services/doctorService";

import { getSchedulesBySpecialtyAndDate } from "../services/scheduleService";
import appointmentService from "../services/appointmentService";

import BannerName from "../components/BannerName";

import CheckIcon from "@mui/icons-material/Check";

import { useNavigate, useLocation } from "react-router-dom";

function AppointmentSpecialtyPage() {
  const { id } = useParams();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [specialty, setSpecialty] = useState(null);
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

  const location = useLocation();

  const typeAppointment = location.state?.typeAppointment || "specialty";
  const packageId = location.state?.healthPackageId || null;

  const [listTimeAppointment, setListTimeAppointment] = useState([
    {
      timeAppointment: "",
      doctorId: "",
      dateAppointment: "",
    },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentService.getAppointmentsBySpecialty(
          id
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
    };
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const generateTimeRanges = (
    start,
    end,
    stepMinutes,
    doctorId,
    scheduleDate,
    list
  ) => {
    const result = [];
    let [hour, minute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const formatted = new Date(scheduleDate).toISOString().split("T")[0];

    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      const startTime = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      // Check nếu thời gian này đã được đặt rồi
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
  };

  const handleBooking = () => {
    if (
      selectedDoctorId &&
      selectedTime?.scheduleId &&
      selectedTime?.timeRange
    ) {
      // Có thể set vào context hoặc global state tại đây nếu cần
      navigate("/appointment-payment", {
        state: {
          user: user,
          doctorId: selectedDoctorId,
          scheduleId: selectedTime.scheduleId,
          timeRange: selectedTime.timeRange,
          symptoms: symptoms,
          specialtyId: id,
          typeAppointment: typeAppointment,
          packageId: packageId,
        },
      });
    }
  };

  const formatVietnameseDate = (dateStr) => {
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
  };

  const selectDoctor = (doctorId) => {
    setSelectedDoctorId(doctorId);

    const matched = schedules.filter(
      (schedule) => schedule.userId._id === doctorId
    );
    console.log("Matched schedules:", matched);
    setScheduleByDoctor(matched); // luôn ghi đè mới
  };

  const selectTime = (scheduleId, timeRange) => {
    setSelectedTime({ scheduleId, timeRange });
  };

  const toggleSchedule = (id) => {
    setExpandedSchedules((prev) => ({
      ...prev,
      [id]: !prev[id], // toggle true/false
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSpecialtyById(id); // gọi API
        setSpecialty(response); // setState chỉ 1 lần
      } catch (err) {
        console.error("Lỗi khi lấy specialty:", err);
      }
    };
    const fetchDoctors = async () => {
      try {
        const response = await DoctorService.getDoctorsBySpecialty(id);
        setDoctors(response);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách bác sĩ:", err);
      }
    };
    const fetchSchedules = async () => {
      try {
        const today = new Date();
const response = await getSchedulesBySpecialtyAndDate(id, today);

        setSchedules(response);
      } catch (error) {
        console.error("Lỗi khi lấy lịch trình:", error);
      }
    };

    if (id) {
      fetchData();
      fetchDoctors();
      fetchSchedules();
    }
  }, [id]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Bạn chưa đăng nhập
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để đặt lịch khám và trải nghiệm đầy đủ dịch vụ.
          </p>
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

  if (!specialty) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Đang tải thông tin chuyên khoa...
          </h2>
        </div>
      </div>
    );
  }

  if (
    !user.phone ||
    !user.email ||
    !user.address ||
    !user.fullName ||
    !user.dob ||
    !user.cidNumber ||
    !user.gender
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Thiếu thông tin cá nhân
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng cập nhật thông tin cá nhân để tiếp tục.
          </p>
          <Link
            to="/user-profile"
            className="inline-block px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-300"
          >
            Cập nhật ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BannerName Text="Đặt lịch khám" />
      {/* chia thành hai phần một bên là Thông tin user một bên là thông tin đặt lịch */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10">
          {/* Thông tin cá nhân */}
          <div className="bg-blue-50 rounded-2xl shadow-xl p-8 border border-gray-100 h-fit">
            {/* Tiêu đề */}
            <h2 className="text-3xl font-bold text-custom-blue mb-6 flex items-center gap-2">
              <svg
                className="w-7 h-7 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Thông tin cá nhân
            </h2>

            {/* Nội dung thông tin */}
            <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed">
              <p>
                <span className="font-medium text-gray-900">Họ và tên:</span>{" "}
                {user.fullName}
              </p>
              <p>
                <span className="font-medium text-gray-900">Ngày sinh:</span>{" "}
                {new Date(user.dob).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium text-gray-900">
                  Số điện thoại:
                </span>{" "}
                {user.phone}
              </p>
              <p>
                <span className="font-medium text-gray-900">Email:</span>{" "}
                {user.email}
              </p>
              <p>
                <span className="font-medium text-gray-900">Địa chỉ:</span>{" "}
                {user.address}
              </p>
            </div>

            {/* Nút cập nhật */}
            <div className="mt-8">
              <Link
                to="/user-profile"
                className="inline-block px-6 py-2.5 text-white text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-700 
                 hover:from-blue-600 hover:to-blue-800 rounded-full shadow transition duration-300"
              >
                Cập nhật thông tin cá nhân
              </Link>
            </div>
          </div>

          {/* Thông tin chuyên khoa */}
          <div className="bg-blue-50 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-custom-blue mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-custom-blue"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 3.61 2.59 6.61 6 7.32V22h2v-5.68c3.41-.71 6-3.71 6-7.32 0-3.87-3.13-7-7-7z" />
              </svg>
              Chuyên khoa : {specialty.specialtyName}
            </h2>
            <div className="space-y-3 text-gray-700 text-base">
              <div className="text-green-500 text-[16px] mb-2 font-semibold">
                Chọn bác sĩ
              </div>
              {/* list bác sĩ theo card */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(
                  (doctor) =>
                    doctor.doctorId.role === "doctor" && (
                      <div
                        key={doctor.doctorId._id}
                        className={`relative bg-white rounded-2xl shadow-sm hover:shadow-xl p-4 border border-gray-200 
                      transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer 
                      ${
                        selectedDoctorId === doctor.doctorId._id
                          ? "ring-2 ring-green-500"
                          : ""
                      }`}
                        onClick={() => selectDoctor(doctor.doctorId._id)}
                      >
                        {/* Dấu check xanh */}
                        {selectedDoctorId === doctor.doctorId._id && (
                          <div className="absolute top-2 right-2 bg-white border border-green-500 text-green-500 rounded-full p-1 shadow">
                            <CheckIcon className="w-5 h-5" />
                          </div>
                        )}

                        {/* Avatar hình tròn */}
                        <img
                          src={doctor.doctorId.avatar || "default-avatar.png"}
                          alt={doctor.doctorId.fullName}
                          className="w-24 h-24 rounded-full object-cover mx-auto mb-3 shadow"
                        />

                        {/* Tên bác sĩ */}
                        <h5 className="text-center text-[16px] font-semibold text-custom-blue mb-1">
                          BS. {doctor.doctorId.fullName}
                        </h5>

                        {/* Mô tả ngắn gọn */}
                        <div
                          className="text-center text-gray-600 text-[13px] mb-3 line-clamp-2"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: doctor.description,
                          }}
                        />

                        {/* Nút thông tin thêm */}
                        <Link
                          to={`/doctors/${doctor.doctorId._id}`}
                          className="block mx-auto w-fit px-4 py-1.5 text-white text-sm bg-gradient-to-r from-blue-500 to-blue-700 
                      hover:from-blue-600 hover:to-blue-800 rounded-full shadow hover:shadow-md transition duration-300"
                        >
                          Thông tin thêm
                        </Link>
                      </div>
                    )
                )}
              </div>

              {/* Thời gian làm việc của bác sĩ */}
              <div className="mt-6">
                <div className="text-green-500 text-[16px] mb-2 font-semibold">
                  Chọn thời gian khám
                </div>
                {scheduleByDoctor.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {scheduleByDoctor.map((schedule) => (
                      <li
                        key={schedule._id}
                        className="p-4 rounded-xl border border-custom-blue shadow-sm bg-white hover:shadow-md transition"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-800 font-medium text-base">
                              {formatVietnameseDate(schedule.date)}
                            </span>

                            <span
                              className={`px-2 py-0.5 whitespace-nowrap text-xs rounded-full font-medium ${
                                schedule.shift === "MORNING"
                                  ? "bg-green-100 text-green-800"
                                  : schedule.shift === "NOON"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {schedule.shift === "MORNING"
                                ? "Buổi sáng"
                                : schedule.shift === "NOON"
                                ? "Buổi trưa"
                                : "Buổi chiều"}
                            </span>
                          </div>
                        </div>

                        {schedule.shift === "MORNING" ||
                        schedule.shift === "NOON" ||
                        schedule.shift === "AFTERNOON" ? (
                          <>
                            <button
                              className="text-sm text-blue-600 hover:underline font-medium mt-2"
                              onClick={() => toggleSchedule(schedule._id)}
                            >
                              {expandedSchedules[schedule._id]
                                ? "Ẩn khung giờ"
                                : "Xem khung giờ"}
                            </button>

                            {expandedSchedules[schedule._id] && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                                {(schedule.shift === "MORNING"
                                  ? generateTimeRanges(
                                      "07:00",
                                      "10:30",
                                      30,
                                      schedule.userId._id,
                                      schedule.date,
                                      listTimeAppointment
                                    )
                                  : schedule.shift === "NOON"
                                  ? generateTimeRanges(
                                      "11:30",
                                      "13:00",
                                      30,
                                      schedule.userId._id,
                                      schedule.date,
                                      listTimeAppointment
                                    )
                                  : generateTimeRanges(
                                      "13:30",
                                      "16:30",
                                      30,
                                      schedule.userId._id,
                                      schedule.date,
                                      listTimeAppointment
                                    )
                                ).map((range, index) => (
                                  <button
                                    key={index}
                                    className={`border rounded-lg py-2 px-4 text-sm transition hover:scale-105 ${
                                      selectedTime &&
                                      selectedTime.scheduleId ===
                                        schedule._id &&
                                      selectedTime.timeRange === range
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : "border-blue-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500"
                                    }`}
                                    onClick={() =>
                                      selectTime(schedule._id, range)
                                    }
                                  >
                                    {range}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="mt-2">
                            <Link
                              to={`/appointment/${schedule._id}`}
                              className="text-blue-600 hover:underline text-sm font-medium"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Không có lịch hẹn nào.</p>
                )}
              </div>
              {/* Mô tả thêm triệu chứng */}
              <div className="mt-6">
                <div className="text-green-500 text-[16px] mb-2 font-semibold">
                  Mô tả triệu chứng
                </div>
                <textarea
                  rows="4"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full p-3 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
                  placeholder="Nhập mô tả triệu chứng của bạn..."
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">
                  Vui lòng mô tả triệu chứng của bạn một cách chi tiết.
                </p>
              </div>
              {/* Nút đặt lịch */}
              <div className="mt-6 flex justify-center">
                {selectedDoctorId &&
                  selectedTime.scheduleId &&
                  selectedTime.timeRange && (
                    <button
                      onClick={handleBooking}
                      className="inline-block px-6 py-2 text-white bg-gradient-to-r from-custom-blue to-blue-700 
                    hover:from-custom-bluehover2 hover:to-blue-800 shadow-md hover:shadow-xl transform hover:-translate-y-[2px] scale-105 
                    transition-all duration-300 ease-in-out rounded-lg"
                    >
                      Đặt lịch khám
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentSpecialtyPage;
