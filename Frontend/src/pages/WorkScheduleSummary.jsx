import React, { useEffect, useState } from "react";
import stepProcessService from "../services/stepProcess"; 
import {
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { Toaster, toast } from "sonner";

const WorkScheduleSummary = () => {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const data = await stepProcessService.getTechnicianRoomServices();
        setRoomData(data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Không thể lấy thông tin phòng làm việc."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoomInfo();
  }, []);

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
              🏥 <strong>Phòng:</strong> {roomData.roomNumber} - {roomData.roomName}
            </Typography>

            <Typography variant="body1" sx={{ mt: 2 }}>
              🛠 <strong>Dịch vụ:</strong>{" "}
              {roomData.services.length > 0
                ? roomData.services.join(", ")
                : "Không có"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 1 }}>
              👨‍⚕️ Danh sách bệnh nhân trong phòng:
            </Typography>
            {roomData.patientQueue.length === 0 ? (
              <Typography color="text.secondary">
                Không có bệnh nhân trong hàng chờ.
              </Typography>
            ) : (
              <List dense>
                {roomData.patientQueue.map((patient, index) => (
                  <ListItem key={patient._id} disablePadding>
                    <ListItemText
                      primary={`${index + 1}. ${patient.fullName}`}
                      secondary={patient.email}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        ) : (
          <Typography color="text.secondary">
            Không có dữ liệu lịch làm việc hôm nay.
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default WorkScheduleSummary;
