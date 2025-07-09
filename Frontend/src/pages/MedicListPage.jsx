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
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const MedicListPage = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/");
    }
  }, []);

  const fetchServices = async () => {
    try {
      const data = await listService();
      setServices(data.services);
      setFilteredServices(data.services);
    } catch (error) {
      toast.error("Không thể tải danh sách dịch vụ.", error);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filtered = services.filter((service) =>
      service.paraclinalName.toLowerCase().includes(searchTerm)
    );
    setFilteredServices(filtered);
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchServices();
    }
  }, [user]);

  return (
    <div className="w-full">
      <Toaster position="top-right" richColors />
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Danh sách dịch vụ cận lâm sàng
        </Typography>

        <TextField
          fullWidth
          label="Tìm kiếm dịch vụ"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 2 }}
        />

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
