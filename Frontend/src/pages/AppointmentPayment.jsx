import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { DoctorService } from "../services/doctorService";
import { getSpecialtyById } from "../services/specialtyService";
import { getScheduleById } from "../services/scheduleService";
import appointmentService from "../services/appointmentService";

import napas247 from "../assets/images/napas247.png";
import mbbank from "../assets/images/mbbank.jpg";
import vietQR from "../assets/images/vietQR.png";

import QRCode from "qrcode";

import { PayOSService } from "../services/payosService";

import { Toaster, toast } from "sonner";

function AppointmentPayment() {
  const location = useLocation();
  const { doctorId, scheduleId, timeRange, symptoms, specialtyId } =
    location.state || {};

  const [doctor, setDoctor] = useState({});
  const [specialty, setSpecialty] = useState({});
  const [schedule, setSchedule] = useState({});
  const [qrUrl, setQrUrl] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [appointmentData, setAppointmentData] = useState({
    patientId: JSON.parse(sessionStorage.getItem("user"))?._id || "",
    doctorId: doctorId || "",
    time: "",
    specialties: specialtyId ? [specialtyId] : [],
    healthPackage: null,
    symptoms: symptoms || "",
  });

  const user = JSON.parse(sessionStorage.getItem("user")) || {};

  const pollingRef = useRef(null);

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
    return `${weekdays[date.getUTCDay()]}, ${date.getDate()} tháng ${
      date.getMonth() + 1
    } năm ${date.getFullYear()}`;
  };
  // Lần 1: fetch dữ liệu bác sĩ, chuyên khoa, lịch hẹn
  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (doctorId) {
          const doctorProfile = await DoctorService.getDoctorProfileById(
            doctorId
          );
          setDoctor(doctorProfile);
        }

        if (specialtyId) {
          const specialtyData = await getSpecialtyById(specialtyId);
          setSpecialty(specialtyData);
        }

        if (scheduleId) {
          const scheduleData = await getScheduleById(scheduleId);
          setSchedule(scheduleData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAll();
  }, [doctorId, specialtyId, scheduleId]);

  // Lần 2: chỉ tạo thanh toán khi specialty.medicalFee đã có
  useEffect(() => {
    const fetchPayOSAndGenerateQR = async () => {
      try {
        if (!doctorId || !specialtyId || !scheduleId || !specialty?.medicalFee)
          return;

        const orderCode =
          (Date.now() % 10000000000000) + Math.floor(Math.random() * 10000);

        const paymentData = {
          orderCode: orderCode,
          amount: specialty.medicalFee,
          description: "Thanh toán phí khám bệnh",
          returnUrl: "http://localhost:3000/payment-success",
          cancelUrl: "http://localhost:3000/payment-cancel",
        };

        const result = await PayOSService.createPayment(paymentData);

        // Lưu orderCode để xác thực thanh toán sau này
        setOrderCode(orderCode);

        // Tạo ảnh QR từ mã raw
        const qrImageUrl = await QRCode.toDataURL(result.qrCode);
        setQrUrl(qrImageUrl);
      } catch (error) {
        console.error("Error creating payment or generating QR:", error);
      }
    };

    fetchPayOSAndGenerateQR();
  }, [doctorId, specialtyId, scheduleId, specialty?.medicalFee]);

  useEffect(() => {
    if (!orderCode) return;

    pollingRef.current = setInterval(async () => {
      try {
        const response = await PayOSService.verifyPayment(orderCode);

        if (response.status === "PAID") {
          try {
            console.log(appointmentData);
            
            await appointmentService.createAppointment(appointmentData);

            clearInterval(pollingRef.current);

            let countdown = 5;
            const id = toast.success(
              `Thanh toán thành công! Chuyển hướng sau ${countdown}s`
            );

            const countdownInterval = setInterval(() => {
              countdown--;
              if (countdown === 0) {
                clearInterval(countdownInterval);
                toast.dismiss(id);
                window.location.href = "/";
              }
            }, 1000);
          } catch (error) {
            console.error("Lỗi khi tạo lịch hẹn:", error);
            toast.error("Đã có lỗi khi tạo lịch hẹn. Vui lòng thử lại.");
          }
        } else {
          console.log("Chưa thanh toán...");
        }
      } catch (err) {
        console.error("Lỗi kiểm tra thanh toán:", err);
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [appointmentData, orderCode]);

  useEffect(() => {
    if (doctorId && scheduleId && specialtyId) {
      if (!schedule?.date || !timeRange) {
        console.error("Lỗi: schedule.date hoặc timeRange đang thiếu!");
        return;
      }

      const [hour, minute] = timeRange.split(":").map(Number);
      const date = new Date(schedule.date);

      date.setHours(hour);
      date.setMinutes(minute);
      date.setSeconds(0);
      date.setMilliseconds(0);

      const utcPlus7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);

      setAppointmentData((prevData) => ({
        ...prevData,
        doctorId: doctorId,
        time: utcPlus7.toISOString(),
        specialties: specialtyId ? [specialtyId] : [],
      }));
    }
  }, [doctorId, schedule.date, scheduleId, specialtyId, timeRange]);

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl p-10 text-gray-800 border border-gray-300">
      <Toaster position="top-right" richColors />
      <h1 className="text-3xl font-bold text-center text-custom-blue mb-8 tracking-wide uppercase">
        Phiếu Khám Bệnh
      </h1>

      {/* Người đặt lịch */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b pb-1 mb-3 text-custom-blue">
          Thông tin người đặt lịch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed">
          <p>
            <strong>Họ và tên:</strong> {user.fullName}
          </p>
          <p>
            <strong>CMND/CCCD:</strong> {user.cidNumber}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {user.phone}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>

      {/* Bác sĩ */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b pb-1 mb-3 text-custom-blue">
          Thông tin bác sĩ
        </h2>
        <div className="space-y-1 text-sm leading-relaxed">
          <p>
            <strong>Bác sĩ:</strong> {doctor.doctorId?.fullName}
          </p>
          <p>
            <strong>Chuyên khoa:</strong> {specialty?.specialtyName}
          </p>
          <p>
            <strong>Mô tả:</strong> {doctor?.description}
          </p>
        </div>
      </div>

      {/* Lịch khám */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b pb-1 mb-3 text-custom-blue">
          Thông tin lịch khám
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm leading-relaxed">
          <p>
            <strong>Phòng khám:</strong> {schedule?.room?.roomNumber}
          </p>
          <p>
            <strong>Giờ khám:</strong> {timeRange}{" "}
            {formatVietnameseDate(schedule?.date)}
          </p>
          <p>
            <strong>Triệu chứng:</strong> {symptoms}
          </p>
        </div>
      </div>

      {/* Thanh toán */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b pb-1 mb-3 text-custom-blue">
          Thông tin thanh toán
        </h2>
        <div className="space-y-1 text-sm leading-relaxed">
          <p>
            <strong>Tổng chi phí:</strong>{" "}
            <span className="text-red-600 font-bold">
              {specialty?.medicalFee?.toLocaleString("vi-VN")} VNĐ
            </span>
          </p>
          <p>
            <strong>Phương thức thanh toán:</strong> Chuyển khoản ngân hàng
          </p>
        </div>
      </div>

      {/* Hướng dẫn chuyển khoản */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold border-b pb-1 mb-3 text-custom-blue">
          Hướng dẫn thanh toán
        </h2>
        <div className="space-y-1 text-sm leading-relaxed">
          <p>Vui lòng chuyển khoản số tiền trên vào tài khoản ngân hàng sau:</p>
          <p>
            <strong>Ngân hàng:</strong> Ngân hàng MB Bank
          </p>
          <p>
            <strong>Số tài khoản:</strong> 0356555425
          </p>
          <p>
            <strong>Chủ tài khoản:</strong> Bệnh viện Phúc Hưng
          </p>
          <p className="mt-2">
            Nội dung chuyển khoản: <em>“Thanh toan kham benh”</em>
          </p>

          <div className="mt-4 flex justify-center">
            <div className="w-[320px]  p-4 bg-white rounded-xl shadow border text-center">
              {/* Logo trên */}
              <img
                src={vietQR}
                alt="VietQR PRO"
                className="mx-auto mb-2 w-[120px]"
              />

              {/* QR Code */}
              <img src={qrUrl} alt="QR Code" className="w-full rounded" />

              {/* Footer ngân hàng */}
              <div className="mt-1 flex justify-center items-center space-x-2">
                <img src={napas247} alt="napas247" className="h-5" />
                <span>|</span>
                <img src={mbbank} alt="MB" className="h-10" />
              </div>
            </div>
          </div>
          <p className="mt-2 pt-1 text-red-600 font-semibold">
            Sau khi chuyển khoản, vui lòng chờ xác nhận thanh toán trong vòng 10
            giây.
          </p>
        </div>
      </div>

      {/* Lời cảm ơn */}
      <div className="text-center text-sm text-green-700 font-medium">
        Cảm ơn quý khách đã tin tưởng và đặt lịch khám tại{" "}
        <span className="font-semibold">Phòng khám Phúc Hưng</span>.
        <br />
        Chúng tôi sẽ liên hệ xác nhận lịch trong thời gian sớm nhất.
      </div>
    </div>
  );
}

export default AppointmentPayment;
