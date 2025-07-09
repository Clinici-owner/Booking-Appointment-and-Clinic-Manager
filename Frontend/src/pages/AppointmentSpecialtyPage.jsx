import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { getSpecialtyById } from "../services/specialtyService";
import { DoctorService } from "../services/doctorService";
import { getAllSchedules } from "../services/scheduleService";

import BannerName from "../components/BannerName";

import CheckIcon from "@mui/icons-material/Check";
function AppointmentSpecialtyPage() {
  const { id } = useParams();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [specialty, setSpecialty] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [scheduleByDoctor, setScheduleByDoctor] = useState([]);

  const selectDoctor = (doctorId) => {
  setSelectedDoctorId(doctorId);

  const matched = schedules.filter(
    (schedule) => schedule.userId._id === doctorId
  );

  console.log("Matched schedules:", matched);
  
  setScheduleByDoctor(matched); // luôn ghi đè mới
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
        const response = await getAllSchedules();
        setSchedules(response);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách lịch:", err);
      }
    };

    if (id) {
      fetchData(); // chỉ gọi khi có id
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
          <div className="bg-blue-50 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-custom-blue mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Thông tin cá nhân
            </h2>
            <div className="space-y-3 text-gray-700 text-base">
              <p>
                <span className="font-semibold">Họ và tên:</span>{" "}
                {user.fullName}
              </p>
              <p>
                <span className="font-semibold">Ngày sinh:</span>{" "}
                {new Date(user.dob).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Số điện thoại:</span>{" "}
                {user.phone}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">Địa chỉ:</span> {user.address}
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/user-profile"
                className="inline-block px-6 py-2 text-white bg-custom-blue hover:bg-custom-bluehover2 rounded-lg transition duration-300"
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
                        className={`relative bg-white rounded-lg shadow-md p-4 hover:shadow-lg duration-300 hover:scale-101 transition cursor-pointer ${
                          selectedDoctorId === doctor.doctorId._id
                            ? "ring-2 ring-green-500"
                            : ""
                        }`}
                        onClick={() => selectDoctor(doctor.doctorId._id)}
                      >
                        {/* Dấu check xanh */}
                        {selectedDoctorId === doctor.doctorId._id && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                            <CheckIcon className="w-5 h-5" />
                          </div>
                        )}
                        <img
                          src={doctor.doctorId.avatar || "default-avatar.png"}
                          alt={doctor.doctorId.fullName}
                          className="w-full rounded-[10px] mx-auto mb-4"
                        />
                        <h5 className="text-[16px] font-semibold text-custom-blue mb-2">
                          BS. {doctor.doctorId.fullName}
                        </h5>
                        <div
                          className="text-green-500 text-[12px] mb-4 line-clamp-2 overflow-hidden"
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

                        <Link
                          to={`/appointment/${doctor.doctorId._id}`}
                          className="inline-block px-3 py-1 text-white text-[14px] bg-custom-blue hover:bg-custom-bluehover2 rounded-lg transition duration-300"
                        >
                          Thông tin thêm
                        </Link>
                      </div>
                    )
                )}
              </div>
              {/* Thời gian làm việc của bác sĩ */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-custom-blue mb-4">
                  Thời gian làm việc
                </h3>
                {scheduleByDoctor.length > 0 ? (
                  <ul className="space-y-2">
                    {scheduleByDoctor.map((schedule) => (
                      <li key={schedule._id} className="border-b py-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700">
                            {new Date(schedule.date).toLocaleDateString()} -{" "}
                            {schedule.shift === "MORNING"
                              ? "Sáng "
                              : schedule.shift === "AFTERNOON"
                              ? "Chiều"
                              : "Tối"}
                          </span>
                          <span className="text-gray-500">
                            Phòng: {schedule.room.roomNumber}
                          </span>
                          <Link
                            to={`/appointment/${schedule._id}`}
                            className="text-custom-blue hover:underline"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Không có lịch hẹn nào.</p>
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
