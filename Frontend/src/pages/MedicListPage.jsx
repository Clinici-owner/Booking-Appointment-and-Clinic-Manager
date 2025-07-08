import React, { useEffect, useState } from "react";
import { listService } from "../services/medicalService";
import { Toaster, toast } from "sonner";
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  TextField,  // Import TextField để tạo ô tìm kiếm
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const MedicListPage = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State lưu trữ từ khóa tìm kiếm
  const [filteredServices, setFilteredServices] = useState([]); // State lưu trữ dịch vụ sau khi lọc
  const navigate = useNavigate();

  const fetchServices = async () => {
    try {
      const data = await listService();
      setServices(data.services);
      setFilteredServices(data.services); // Mặc định hiển thị tất cả các dịch vụ
    } catch (error) {
      toast.error("Không thể tải danh sách dịch vụ.", error);
    }
  };

  // Hàm lọc dịch vụ theo từ khóa tìm kiếm
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    // Lọc dịch vụ dựa trên tên dịch vụ
    const filtered = services.filter((service) =>
      service.paraclinalName.toLowerCase().includes(searchTerm)
    );
    setFilteredServices(filtered);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="w-full">
      <Toaster position="top-right" richColors />
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Danh sách dịch vụ cận lâm sàng
        </Typography>

        {/* Trường tìm kiếm */}
        <TextField
          fullWidth
          label="Tìm kiếm dịch vụ"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch} // Gọi hàm handleSearch khi người dùng nhập
          sx={{ mb: 2 }}
        />

        {/* Lối tắt quay lại trang tạo dịch vụ */}
        <Button
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          onClick={() => navigate("/createMedical")}
        >
          Tạo dịch vụ mới
        </Button>

        {filteredServices.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Không tìm thấy dịch vụ nào.
          </Typography>
        ) : (
          <List sx={{ padding: 0 }}>
            {filteredServices.map((s, index) => (
              <React.Fragment key={s._id}>
                <ListItem
                  sx={{ alignItems: "flex-start", px: 0, flexDirection: "column" }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="bold">
                        {s.paraclinalName}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Giá: {s.paraPrice} VNĐ | Phòng: {s.room?.roomNumber || "Không rõ"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={s.status === "available" ? "green" : "red"}
                        >
                          Trạng thái:{" "}
                          {s.status === "available" ? "Đang hoạt động" : "Tạm dừng"}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < filteredServices.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </div>
  );
};

export default MedicListPage;
