import React, { useEffect, useState } from "react";
import stepProcessService from "../services/stepProcess";
import {
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
} from "@mui/material";
import { Toaster, toast } from "sonner";

const WorkScheduleSummary = () => {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // để disable nút trong khi xử lý

  const fetchRoomInfo = async () => {
    try {
      setLoading(true);
      const data = await stepProcessService.getTechnicianRoomServices();
      setRoomData(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Không thể lấy thông tin phòng làm việc."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomInfo();
  }, []);

  const handleCompleteStep = async (patientId) => {
    try {
      setProcessingId(patientId);
      await stepProcessService.completeCurrentStep(patientId);
      toast.success("✅ Hoàn thành bước xử lý cho bệnh nhân.");
      await fetchRoomInfo();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Lỗi khi hoàn tất bước xử lý."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full">
      <Toaster position="top-right" richColors />
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Lịch làm việc hôm nay
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : roomData ? (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              📅 <strong>Ngày:</strong>{" "}
              {new Date().toLocaleDateString("vi-VN")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              🏥 <strong>Phòng:</strong> {roomData.roomNumber} -{" "}
              {roomData.roomName}
            </Typography>

            <Typography variant="body1" sx={{ mt: 2 }}>
              🛠 <strong>Cận lâm sàn:</strong>{" "}
              {Array.isArray(roomData.services) && roomData.services.length > 0
                ? roomData.services
                    .map((s) => (typeof s === "string" ? s : s.name))
                    .join(", ")
                : "Không có"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 1 }}>
              👨‍⚕️ Danh sách bệnh nhân trong phòng:
            </Typography>

            {!Array.isArray(roomData.patientQueue) ||
            roomData.patientQueue.length === 0 ? (
              <Typography color="text.secondary">
                Không có bệnh nhân trong hàng chờ.
              </Typography>
            ) : (
              <List dense>
                {roomData.patientQueue.map((patient, index) => (
                  <ListItem
                    key={patient._id}
                    disablePadding
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={`${index + 1}. ${patient.fullName}`}
                      secondary={patient.email}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleCompleteStep(patient._id)}
                      disabled={processingId === patient._id}
                    >
                      {processingId === patient._id ? "Đang xử lý..." : "Hoàn tất"}
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        ) : (
          <Typography color="text.secondary">
            Hôm nay là ngày nghỉ.
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default WorkScheduleSummary;
