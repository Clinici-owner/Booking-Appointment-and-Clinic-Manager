import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { MedicalProcessService } from "../services/medicalProcessService";

const MyProcessPage = () => {
  const [process, setProcess] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const data = await MedicalProcessService.getMyProcessByUserId();
        setProcess(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProcess();
  }, []);

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!process) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" mt={2}>
          Đang tải tiến trình...
        </Typography>
      </Container>
    );
  }

  const activeStep = process.currentStep - 1;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Tiến trình khám bệnh
      </Typography>

      {/* Thông tin bệnh nhân */}
      {process.patient && (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              alt={process.patient.fullName}
              src={process.patient.avatar}
              sx={{ width: 56, height: 56 }}
            />
            <Box>
              <Typography variant="subtitle1">Bệnh nhân: {process.patient.fullName}</Typography>
              <Typography color="text.secondary" variant="body2">
                Email: {process.patient.email}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Thông tin bác sĩ */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            alt={process.doctor.fullName}
            src={process.doctor.avatar}
            sx={{ width: 56, height: 56 }}
          />
          <Box>
            <Typography variant="subtitle1">Bác sĩ: {process.doctor.fullName}</Typography>
            <Typography color="text.secondary" variant="body2">
              Email: {process.doctor.email}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {/* Các bước từ API */}
        {process.steps.map((step, index) => (
          <Step key={index} completed={step.isCompleted}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label.Mui-completed": { color: "green" },
                "& .MuiStepLabel-label.Mui-active": { color: "blue" },
              }}
            >
              {step.serviceName}
              <Typography variant="caption" display="block">
                Phòng {step.roomNumber} : {step.roomName}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {step.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}
              </Typography>
            </StepLabel>
          </Step>
        ))}

        {/* Bước cứng: Trở về phòng chẩn đoán */}
        <Step completed={process.status === "completed"}>
          <StepLabel
            sx={{
              "& .MuiStepLabel-label.Mui-completed": { color: "green" },
              "& .MuiStepLabel-label.Mui-active": { color: "blue" },
              "& .MuiStepLabel-label": {
                color: process.status === "completed" ? "green" : "gray",
              },
            }}
          >
            Trở về phòng chẩn đoán
            <Typography variant="caption" display="block">
              Phòng chẩn đoán tổng quát
            </Typography>
            <Typography
              variant="caption"
              display="block"
              color={process.status === "completed" ? "success.main" : "text.secondary"}
            >
            </Typography>
          </StepLabel>
        </Step>
      </Stepper>

      {/* Trạng thái quy trình */}
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="text.primary">
          Trạng thái:{" "}
          <strong>
            {process.status === "completed"
              ? "Đã hoàn tất"
              : process.status === "in_progress"
                ? "Đang thực hiện"
                : "Khác"}
          </strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Cập nhật lần cuối:{" "}
          {new Date(process.updatedAt).toLocaleString("vi-VN")}
        </Typography>
      </Box>
    </Container>
  );
};

export default MyProcessPage;
