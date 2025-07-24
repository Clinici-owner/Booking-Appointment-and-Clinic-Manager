import React, { useEffect, useState } from "react";
import { CalendarDays, CheckCircle, XCircle, Clock } from "lucide-react";
import appointmentService from "../services/appointmentService";
import { Link } from "react-router-dom";

function AppointmentPatientPage() {
  const userData = JSON.parse(sessionStorage.getItem("user"));
  const [appointments, setAppointments] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState("pending");

  const formatVietnameseDate = (dateStr) => {
    const date = new Date(dateStr);
    const weekdays = [
      "Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4",
      "Thứ 5", "Thứ 6", "Thứ 7"
    ];
    return `${weekdays[date.getUTCDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await appointmentService.getAppointmentsByPatient(userData._id);
        setAppointments(response);
      } catch (error) {
        console.error("Lỗi khi lấy lịch hẹn:", error);
      }
    };
    if (userData?._id) fetchAppointments();
  }, [userData]);

  const getFilteredAppointments = () => {
    if (filteredStatus === "pending") {
      return appointments.filter((a) =>
        a.status === "pending" || a.status === "confirmed" || a.status === "in-progress"
      );
    }
    return appointments.filter((a) => a.status === filteredStatus);
  };


  const renderAppointmentCard = (item) => (
    <div
      key={item._id}
      className="flex justify-between items-center bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-800">
          Bác sĩ: {item.doctorId?.fullName || "Không rõ"}
        </h3>
        {item.healthPackage ? (
          <p className="text-sm text-gray-600">
            Gói khám: {item.healthPackage.packageName || "Không rõ"}
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Chuyên khoa: {item.specialties[0]?.specialtyName || "Không rõ"}
          </p>
        )}
        <p className="text-sm text-gray-600">
          Thời gian:{" "}
          <span className="font-medium text-black">
            {item.time.toString().substring(11, 16)} giờ,{" "}
            {formatVietnameseDate(item.time)}
          </span>
        </p>
      </div>

      <Link
        to={`/appointment-patient/appointment-detail/${item._id}`}
        className="px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
      >
        Xem chi tiết
      </Link>
    </div>
  );

  const renderButton = (label, statusKey, bgColor, textColor) => (
    <button
      className={`px-4 py-2 rounded-full text-sm font-semibold transition border shadow-sm ${
        filteredStatus === statusKey
          ? `${bgColor} text-white`
          : `bg-white ${textColor} border-${textColor.replace("text-", "")}`
      } hover:scale-105`}
      onClick={() => setFilteredStatus(statusKey)}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-blue-50 rounded-lg shadow-lg mb-10 ">
      <h1 className="text-3xl font-bold mb-8 text-center text-custom-blue">
        Lịch hẹn của tôi
      </h1>

      {/* Nút lọc trạng thái */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {renderButton("Đã đặt lịch", "pending", "bg-blue-600", "text-blue-600")}
        {renderButton("Đã hủy", "cancelled", "bg-red-600", "text-red-600")}
        {renderButton("Đã khám", "completed", "bg-green-600", "text-green-600")}
      </div>

      {/* Danh sách lịch hẹn */}
      <div className="space-y-4">
        {getFilteredAppointments().length === 0 ? (
          <div className="text-center text-gray-400 italic">
            Không có lịch hẹn phù hợp.
          </div>
        ) : (
          getFilteredAppointments().map(renderAppointmentCard)
        )}
      </div>
    </div>
  );
}

export default AppointmentPatientPage;
