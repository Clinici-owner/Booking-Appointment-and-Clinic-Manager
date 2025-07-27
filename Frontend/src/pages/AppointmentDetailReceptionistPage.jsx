import React, { useEffect, useRef, useState } from "react";

import { useLocation } from "react-router-dom";
import { updatePayment } from "../services/paymentService";
import { getPaymentByAppointmentId } from "../services/paymentService";
import { PayOSService } from "../services/payosService";

import napas247 from "../assets/images/napas247.png";
import mbbank from "../assets/images/mbbank.jpg";
import vietQR from "../assets/images/vietQR.png";

import QRCode from "qrcode";

import { Toaster, toast } from "sonner";
import { MedicalProcessService } from "../services/medicalProcessService";

function AppointmentDetailReceptionistPage() {
  const [payment, setPayment] = useState(null);
  const [qrUrl, setQrUrl] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const { state } = useLocation();
  const [selectedMethod, setSelectedMethod] = useState(null); // "cash" | "bank"

  const appointment = state?.appointment;

  const pollingRef = useRef(null);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const paymentData = await getPaymentByAppointmentId(appointment._id);
        console.log("Payment Data:", paymentData);
        setPayment(paymentData);
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    };

    fetchPayment();
  }, [appointment]);

  useEffect(() => {
    if (!payment) return;

    const fetchPayOSAndGenerateQR = async () => {
      try {
        const orderCode =
          (Date.now() % 10000000000000) + Math.floor(Math.random() * 10000);

        const totalServiceFee = payment.serviceFee?.reduce(
          (sum, item) => sum + (item.fee || 0),
          0
        );

        const paymentRequest = {
          orderCode: orderCode,
          amount: totalServiceFee || 0,
          description: "Thanh toán phí dịch vụ",
          returnUrl: "https://booking-appointment-be.up.railway.app/payment-success",
          cancelUrl: "https://booking-appointment-be.up.railway.app/payment-cancel",
        };

        const result = await PayOSService.createPayment(paymentRequest);

        setOrderCode(orderCode);
        const qrImageUrl = await QRCode.toDataURL(result.qrCode);
        setQrUrl(qrImageUrl);
      } catch (error) {
        console.error("Error creating payment or generating QR:", error);
      }
    };

    fetchPayOSAndGenerateQR();
  }, [payment]);

  const createProcessStep = async (payment) => {

    if (!payment || !payment.serviceFee || payment.serviceFee.length === 0) {
      throw new Error("Không có dịch vụ cận lâm sàng để tạo tiến trình khám.");
    }

    const processStepPromises = payment.serviceFee.map((step, idx) =>
      MedicalProcessService.createProcessStep({
        serviceId: step.serviceId,
        notes: step.notes || "",
        patientId: payment.appointmentId.patientId, // vẫn truyền patientId cho bước processStep nếu cần
        isFirstStep: idx === 0,
      }).catch((error) => {
        console.error("Error creating process step:", error);
        throw new Error("Failed to create one or more process steps");
      })
    );

    const createdSteps = await Promise.all(processStepPromises);
    const processStepIds = createdSteps
      .map((step) => step?._id)
      .filter(Boolean);

    if (processStepIds.length !== payment.serviceFee.length) {
      throw new Error("Some process steps failed to create");
    }

      await MedicalProcessService.createMedicalProcess({
            appointmentId: payment.appointmentId?._id,
            doctorId: payment.appointmentId?.doctorId || '',
            processSteps: processStepIds
      });

    return processStepIds;
  }
  useEffect(() => {
    if (!orderCode) return;

    pollingRef.current = setInterval(async () => {
      try {
        const response = await PayOSService.verifyPayment(orderCode);

        if (response.status === "PAID") {
          try {
            const paymentUpdateData = {
              methodService: "banking",
            };

            await createProcessStep(payment);

            await updatePayment(payment._id, paymentUpdateData);
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
                window.location.href =
                  "/receptionist/appointment-receptionist/detail/" +
                  appointment._id;
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
  }, [orderCode, payment, appointment]);

  if (!appointment) return <p>Không có dữ liệu lịch hẹn.</p>;

  const doctor = appointment.doctorId;
  const patient = appointment.patientId;
  const specialty = appointment.specialties?.[0];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 bg-white rounded-xl shadow-lg space-y-10">
      <h1 className="text-3xl font-bold text-blue-600 text-center">
        Chi tiết lịch hẹn
      </h1>

      {/* Thông tin chung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-6">
        {/* Bệnh nhân */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">
            Thông tin bệnh nhân
          </h2>
          <p>
            <strong>Họ tên:</strong> {patient.fullName}
          </p>
          <p>
            <strong>CMND:</strong> {patient.cidNumber}
          </p>
          <p>
            <strong>Ngày sinh:</strong>{" "}
            {new Date(patient.dob).toLocaleDateString()}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {patient.phone}
          </p>
          <p>
            <strong>Email:</strong> {patient.email}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {patient.address}
          </p>
        </div>

        {/* Bác sĩ */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">
            Thông tin bác sĩ
          </h2>
          <p>
            <strong>Họ tên:</strong> {doctor.fullName}
          </p>
          <p>
            <strong>Email:</strong> {doctor.email}
          </p>
          <p>
            <strong>Chuyên khoa:</strong> {specialty?.specialtyName}
          </p>
          <p>
            <strong>Phí khám:</strong> {specialty?.medicalFee?.toLocaleString()}{" "}
            VND
          </p>
        </div>
      </div>

      {/* Lịch hẹn */}
      <div className="space-y-2 border-b pb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Thông tin lịch hẹn
        </h2>
        <p>
          <strong>Mã lịch hẹn:</strong> {appointment._id}
        </p>
        <p>
          <strong>Thời gian khám:</strong>{" "}
          {new Date(appointment.time).toLocaleString()}
        </p>
        <p>
          <strong>Triệu chứng:</strong> {appointment.symptoms}
        </p>
        <p>
          <strong>Ngày tạo:</strong>{" "}
          {new Date(appointment.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Tiến trình khám */}
      <div className="space-y-4 border-b pb-6">
        <h2 className="text-xl font-semibold text-gray-800">Tiến trình khám</h2>
        {payment?.serviceFee?.length > 0 ? (
          <div className="grid gap-4">
            {payment.serviceFee.map((feeItem, index) => (
              <div
                key={feeItem._id || index}
                className="border p-4 rounded-lg bg-gray-50 shadow-sm space-y-1"
              >
                <p>
                  <strong>Dịch vụ {index + 1}:</strong>
                </p>
                <p>
                  <strong>Tên dịch vụ:</strong>{" "}
                  {feeItem.serviceId?.paraclinalName}
                </p>
                <p>
                  <strong>Phòng:</strong> {feeItem.serviceId?.room?.roomNumber}
                </p>
                <p>
                  <strong>Giá:</strong> {feeItem.fee?.toLocaleString()} VND
                </p>
              </div>
            ))}
            <p className="font-semibold">
              Tổng phí dịch vụ cận lâm sàng:{" "}
              <div className="text-blue-600">
                {payment.serviceFee
                  .reduce((sum, item) => sum + (item.fee || 0), 0)
                  .toLocaleString()}{" "}
                VND
              </div>
            </p>
          </div>
        ) : (
          <p className="italic text-gray-500">
            Không có dịch vụ cận lâm sàng nào được thanh toán.
          </p>
        )}
      </div>

      {/* Phương thức thanh toán */}
      {payment?.methodService !== "none" ? (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 shadow-sm flex items-center space-x-3">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="text-lg font-semibold text-green-700">
            Đã thanh toán thành công
          </h2>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Chọn phương thức thanh toán
          </h2>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedMethod("cash")}
              className={`px-4 py-2 rounded-md font-medium border transition ${
                selectedMethod === "cash"
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
            >
              Tiền mặt
            </button>

            <button
              onClick={() => setSelectedMethod("bank")}
              className={`px-4 py-2 rounded-md font-medium border transition ${
                selectedMethod === "bank"
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "bg-white border-gray-300 hover:bg-gray-100"
              }`}
            >
              Chuyển khoản
            </button>
          </div>

          {/* Chuyển khoản */}
          {selectedMethod === "bank" && (
            <div className="text-sm leading-relaxed space-y-2">
              <p>
                Vui lòng chuyển khoản số tiền trên vào tài khoản ngân hàng sau:
              </p>
              <p>
                <strong>Ngân hàng:</strong> MB Bank
              </p>
              <p>
                <strong>Số tài khoản:</strong> 0356555425
              </p>
              <p>
                <strong>Chủ tài khoản:</strong> Bệnh viện Phúc Hưng
              </p>
              <p className="mt-2">
                <strong>Nội dung:</strong> <em>“Thanh toan kham benh”</em>
              </p>

              {/* QR */}
              <div className="flex justify-center mt-4">
                <div className="w-[320px] p-4 bg-white border rounded-xl shadow text-center space-y-2">
                  <img
                    src={vietQR}
                    alt="VietQR PRO"
                    className="mx-auto w-[100px]"
                  />
                  <img src={qrUrl} alt="QR Code" className="w-full rounded" />
                  <div className="flex justify-center items-center gap-2">
                    <img src={napas247} alt="napas247" className="h-5" />
                    <span>|</span>
                    <img src={mbbank} alt="MB" className="h-8" />
                  </div>
                </div>
              </div>

              <p className="text-red-600 font-semibold">
                Sau khi chuyển khoản, vui lòng chờ xác nhận thanh toán trong
                vòng 10 giây.
              </p>
              <p className="text-red-600 font-semibold">
                Vui lòng tới sớm 15 phút trước giờ khám.
              </p>
            </div>
          )}

          {/* Tiền mặt */}
          {selectedMethod === "cash" && (
            <>
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 font-medium rounded-md shadow-sm">
                Bệnh nhân sẽ thanh toán bằng tiền mặt tại quầy lễ tân.
              </div>
              <button
                onClick={async () => {
                  if (!payment) {
                    toast.error("Không có thông tin thanh toán để cập nhật.");
                    return;
                  }

                  try {
                    const paymentUpdateData = { methodService: "cash" };
                    await updatePayment(payment._id, paymentUpdateData);
                    await createProcessStep(payment);
                    toast.success("Thanh toán thành công!");
                    setTimeout(() => {
                      window.location.href = `/receptionist/appointment-receptionist/detail/${appointment._id}`;
                    }, 2000);
                  } catch (error) {
                    console.error("Lỗi cập nhật:", error);
                    toast.error("Cập nhật thanh toán thất bại.");
                  }
                }}
                className="mt-4 px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-bluehover2 transition-colors"
              >
                Đã nhận thanh toán tiền mặt
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AppointmentDetailReceptionistPage;
