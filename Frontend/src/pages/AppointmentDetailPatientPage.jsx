import React, { useState, useEffect } from "react";

import appointmentService from "../services/appointmentService";
import { getScheduleByDoctorAndShiftAndDate } from "../services/scheduleService";
import { DoctorService } from "../services/doctorService";

import { useParams } from "react-router-dom";

function AppointmentDetailPatientPage() {
  const [appointment, setAppointment] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const { id } = useParams();
  //   const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentService.getAppointmentById(id);
        setAppointment(response);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin lịch hẹn:", error);
      }
    };
    fetchAppointment();
  }, [id]);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (appointment && appointment.doctorId) {
        try {
          const doctorProfile = await DoctorService.getDoctorProfileById(
            appointment.doctorId._id
          );
          setDoctorProfile(doctorProfile);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin bác sĩ:", error);
        }
      }
    };
    fetchDoctorProfile();
  }, [appointment]);

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
    return `${weekdays[date.getUTCDay()]}, ngày ${date.getDate()} tháng ${
      date.getMonth() + 1
    } năm ${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      if (appointment && appointment.doctorId && appointment.time) {
        try {
          // Chuyển giờ UTC sang giờ Việt Nam
          const utcDate = new Date(appointment.time);
          const vnDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);

          // Format ngày theo yyyy-MM-dd
          const formattedDate = vnDate.toISOString().split("T")[0];

          // Lấy giờ phút
          const hour = vnDate.getHours();
          const minute = vnDate.getMinutes();
          const totalMinutes = hour * 60 + minute;

          // Xác định shift
          let shift = "AFTERNOON";
          if (totalMinutes >= 420 && totalMinutes < 690) shift = "MORNING";
          else if (totalMinutes >= 690 && totalMinutes < 810) shift = "NOON";

          // Gọi API lấy lịch trình
          const schedule = await getScheduleByDoctorAndShiftAndDate(
            appointment.doctorId._id,
            shift,
            formattedDate
          );

          setSchedule(schedule);
        } catch (error) {
          console.error("Lỗi khi lấy lịch trình:", error);
        }
      }
    };

    fetchSchedule();
  }, [appointment]);

  if (!appointment) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl p-10 text-gray-800 border border-gray-300 mt-10 mb-10">
      <h1 className="text-3xl font-bold text-center text-custom-blue mb-8 tracking-wide uppercase">
        Phiếu Khám Bệnh
      </h1>

      {/* Người đặt lịch */}
      <div className="mb-6">
        <h2 className="text-[16px] font-semibold border-b pb-1 mb-3 text-custom-blue uppercase">
          Thông tin người đặt lịch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed">
          <p>
            <strong>Họ và tên:</strong> {appointment.patientId.fullName}
          </p>
          <p>
            <strong>CMND/CCCD:</strong> {appointment.patientId.cidNumber}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {appointment.patientId.phone}
          </p>
          <p>
            <strong>Email:</strong> {appointment.patientId.email}
          </p>
        </div>
      </div>

      {/* Bác sĩ */}
      <div className="mb-6">
        <h2 className="text-[16px] font-semibold border-b pb-1 mb-3 text-custom-blue uppercase">
          Thông tin bác sĩ
        </h2>
        <div className="space-y-1 text-sm leading-relaxed">
          <p>
            <strong>Bác sĩ:</strong> {appointment.doctorId?.fullName}
          </p>
          <p>
            <strong>Chuyên khoa:</strong>{" "}
            {appointment.specialties[0]?.specialtyName}
          </p>
          <p>
            <strong>Mô tả:</strong>{" "}
            {doctorProfile?.description || "Chưa cung cấp"}
          </p>
        </div>
      </div>

      {/* Lịch khám */}
      <div className="mb-6">
        <h2 className="text-[16px] font-semibold border-b pb-1 mb-3 text-custom-blue uppercase">
          Thông tin lịch khám
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed">
          <p>
            <strong>Phòng khám:</strong> {schedule?.room?.roomNumber}
          </p>
          <p className="whitespace-nowrap">
            <strong>Giờ khám:</strong>{" "}
            {appointment.time.toString().substring(11, 16)}h,{" "}
            {formatVietnameseDate(appointment.time)}
          </p>
          <p>
            <strong>Triệu chứng:</strong>{" "}
            {appointment.symptoms || "Chưa cung cấp"}
          </p>
        </div>
      </div>

      {/* Thanh toán */}
      <div className="mb-6">
        <h2 className="text-[16px] font-semibold border-b pb-1 mb-3 text-custom-blue uppercase">
          Thông tin thanh toán
        </h2>
        <div className="space-y-1 text-sm leading-relaxed">
          <p>
            <strong>Tổng chi phí:</strong>{" "}
            <span className="text-red-600 font-bold">
              {appointment.specialties[0]?.medicalFee?.toLocaleString("vi-VN")}{" "}
              VNĐ
            </span>
          </p>
          <p>
            <strong>Phương thức thanh toán:</strong> Chuyển khoản ngân hàng
          </p>
        </div>
      </div>

      {/* Hướng dẫn chuyển khoản */}
      <div className="mb-8">
        <p className="mt-2 pt-1 text-red-600 font-semibold">
          Vui lòng tới sớm 15 phút trước giờ khám đã hẹn. Nếu có bất kỳ thay đổi
          nào về lịch khám, chúng tôi sẽ thông báo qua số điện thoại hoặc email
          đã cung cấp.
        </p>
      </div>
    </div>
  );
}

export default AppointmentDetailPatientPage;
