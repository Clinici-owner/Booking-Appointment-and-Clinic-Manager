import React from "react";

function AppointmentManageCard({ appointment, onClick }) {
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
    return `${weekdays[date.getUTCDay()]} ngày ${date.getDate()} tháng ${
      date.getMonth() + 1
    } năm ${date.getFullYear()}`;
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const formattedTime = new Date(appointment.time);
  const timeString = formattedTime.toISOString().substring(11, 16); // hh:mm

  return (
    <div
      className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl p-6 mb-6 border border-gray-100 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.01] group"
      onClick={() => onClick(appointment)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-200">
            {appointment.patientId?.fullName}
          </h3>
        </div>

        {!appointment.hideStatus && (
        <span
          className={`text-sm font-semibold px-3 py-1.5 rounded-full ${getStatusStyles(
            appointment.status
          )}`}
        >
          {appointment.status === "pending"
            ? "Chờ xác nhận"
            : appointment.status === "confirmed"
            ? "Đã xác nhận"
            : appointment.status === "cancelled"
            ? "Đã hủy"
            : "Đã khám xong"}
        </span>
  )}
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">Mã bệnh nhân:</span>
          <span className="ml-1 text-gray-600 font-medium">
            {appointment.patientId?.cidNumber}
          </span>
        </p>
      </div>
      {/* Bác sĩ */}
      <div className="flex items-center space-x-2 mb-4">
        <p className="text-gray-700">
          <span className="font-semibold text-gray-900">Bác sĩ:</span>
          <span className="ml-1 text-blue-600 font-medium">
            {appointment.doctorId?.fullName}
          </span>
        </p>
      </div>

      {/* Giờ khám */}
      <div className="flex items-center space-x-2 mb-4">
        <p className="text-gray-700 whitespace-nowrap">
          <strong>Giờ khám:</strong> {timeString}h{" "}
          {formatVietnameseDate(appointment.time)}
        </p>
      </div>

      {/* Chuyên khoa */}
      {appointment.specialties?.length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Chuyên khoa:</span>
            <span className="ml-1 text-purple-600 font-medium">
              {appointment.specialties[0].specialtyName}
            </span>
          </p>
        </div>
      )}

      {/* Gói khám */}
      {appointment.healthPackage?.packageName && (
        <div className="flex items-center space-x-2 mb-4">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Gói khám:</span>
            <span className="ml-1 text-orange-600 font-medium">
              {appointment.healthPackage.packageName}
            </span>
          </p>
        </div>
      )}

      {/* Triệu chứng */}
      <div className="border-t border-gray-100 pt-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900 block mb-1">
              Triệu chứng:
            </span>
            <span className="text-gray-600 leading-relaxed">
              {appointment.symptoms}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppointmentManageCard;
