import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert
} from "@mui/material";
import {
  Download as DownloadIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import appointmentService from "../services/appointmentService";
import { getScheduleByDoctorAndShiftAndDate } from "../services/scheduleService";
import { DoctorService } from "../services/doctorService";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

function AppointmentDetailPatientPage() {
  const [appointment, setAppointment] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const pdfRef = useRef();

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentService.getAppointmentById(id);
        setAppointment(response);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin lịch hẹn:", error);
        setError("Không thể tải thông tin lịch hẹn");
      }
    };
    fetchAppointment();
  }, [id]);

  // Fetch doctor profile
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

  // Fetch schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      if (appointment && appointment.doctorId && appointment.time) {
        try {
          const utcTime = dayjs(appointment.time).utc();

          const hour = utcTime.hour(); // kiểu số: 0 → 23
          const minute   = utcTime.minute(); // kiểu số: 0 → 59

          const utcDate = new Date(appointment.time);
          const vnDate = new Date(utcDate.getTime());
          const formattedDate = vnDate.toISOString().split("T")[0];

          const totalMinutes = hour * 60 + minute;


          let shift = "AFTERNOON";
          if (totalMinutes >= 420 && totalMinutes < 690) shift = "MORNING";
          else if (totalMinutes >= 690 && totalMinutes < 810) shift = "NOON";
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

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadPDF = () => {
    setIsGeneratingPDF(true);
    const input = pdfRef.current;

    html2canvas(input, {
      scale: 2,
      logging: false,
      useCORS: true,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 190;
        // eslint-disable-next-line no-unused-vars
        const pageHeight = 277;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save(`Phieu_Kham_Benh_${appointment.patientId.fullName}.pdf`);
      })
      .catch((err) => {
        console.error("Lỗi khi tạo PDF:", err);
        setError("Có lỗi xảy ra khi tạo PDF");
      })
      .finally(() => {
        setIsGeneratingPDF(false);
      });
  };

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!appointment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
      {/* Header với nút download */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pt: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          Phiếu Khám Bệnh
        </Typography>
        <Button
          onClick={downloadPDF}
          disabled={isGeneratingPDF}
          variant="contained"
          startIcon={isGeneratingPDF ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          sx={{ textTransform: 'none' }}
        >
          {isGeneratingPDF ? 'Đang tạo PDF...' : 'Tải về PDF'}
        </Button>
      </Box>

      {/* Nội dung chính - sẽ được chuyển thành PDF */}
      <Paper ref={pdfRef} elevation={3} sx={{ p: 4, mb: 4 }}>
        {/* Header PDF */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
            PHIẾU KHÁM BỆNH
          </Typography>
          <Divider sx={{ borderWidth: 2, borderColor: 'primary.main', my: 2 }} />
          <Typography variant="h6" color="text.secondary">
            PHÒNG KHÁM PHÚC HƯNG
          </Typography>
        </Box>

        {/* Thông tin người đặt lịch */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 2 }}>
            <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Thông tin người đặt lịch
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Họ và tên:</strong> {appointment.patientId.fullName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>CMND/CCCD:</strong> {appointment.patientId.cidNumber}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Số điện thoại:</strong> {appointment.patientId.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Email:</strong> {appointment.patientId.email}</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Thông tin bác sĩ */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 2 }}>
            <MedicalServicesIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Thông tin bác sĩ
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Bác sĩ:</strong> {appointment.doctorId?.fullName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Chuyên khoa:</strong> {appointment.specialties[0]?.specialtyName}</Typography>
            </Grid>
          </Grid>
          {doctorProfile?.description && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Giới thiệu:</strong> {doctorProfile.description}</Typography>
            </Box>
          )}
        </Box>

        {/* Thông tin lịch khám */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 2 }}>
            <ScheduleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Thông tin lịch khám
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Phòng khám:</strong> {schedule?.room?.roomNumber || "Chưa xác định"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Ngày khám:</strong> {formatVietnameseDate(appointment.time)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Giờ khám:</strong> {formatTime(appointment.time)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Mã lịch hẹn:</strong> {appointment._id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Triệu chứng:</strong> {appointment.symptoms || "Chưa cung cấp"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Hình thức khám:</strong> {appointment.healthPackage != null ? "Gói sức khỏe" : "Chuyên khoa"}</Typography>
            </Grid>
          </Grid>
          {appointment.healthPackage && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Tên gói khám:</strong> {appointment.healthPackage.packageName}</Typography>
            </Box>
          )}
        </Box>

        {/* Thông tin thanh toán */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" sx={{ borderBottom: 2, borderColor: 'primary.main', pb: 1, mb: 2 }}>
            <PaymentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Thông tin thanh toán
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>
                <strong>Chi phí khám:</strong>{" "}
                <Box component="span" color="error.main" fontWeight="bold">
                  {appointment.specialties[0]?.medicalFee?.toLocaleString("vi-VN")} VNĐ
                </Box>
              </Typography>
            </Grid>
            {appointment.healthPackage && (
              <Grid item xs={12}>
                <Typography>
                  <strong>Chi phí gói:</strong>{" "}
                  <Box component="span" color="error.main" fontWeight="bold">
                    {appointment.healthPackage.price?.toLocaleString("vi-VN")} VNĐ
                  </Box>
                </Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                Lưu ý: Chi phí trên chưa bao gồm các xét nghiệm và cận lâm sàng nếu có
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Phương thức thanh toán:</strong> Chuyển khoản ngân hàng</Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Hướng dẫn và lưu ý */}
        <Box sx={{ borderTop: 2, borderColor: 'divider', pt: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Hướng dẫn và lưu ý
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Vui lòng đến sớm 15 phút trước giờ hẹn để hoàn tất thủ tục đăng ký" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có) khi đến khám" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Thông báo với phòng khám nếu có bất kỳ thay đổi nào về lịch hẹn" />
            </ListItem>
            <ListItem>
              <ListItemText primary={
                <Typography>
                  Mọi thắc mắc xin liên hệ hotline:{" "}
                  <Box component="span" fontWeight="bold">1900 1234</Box>
                </Typography>
              } />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Box>
  );
}

export default AppointmentDetailPatientPage;