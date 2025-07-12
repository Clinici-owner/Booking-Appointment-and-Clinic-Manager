import React, { useEffect, useState } from "react";
import {
  listService,
  editMedicalService
} from "../services/medicalService";
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
  MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const MedicListPage = () => {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", status: "available" });

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
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = services.filter((service) =>
      service.paraclinalName.toLowerCase().includes(term)
    );
    setFilteredServices(filtered);
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchServices();
    }
  }, [user]);

  const handleEditClick = (service) => {
    setEditingId(service._id);
    setEditForm({
      name: service.paraclinalName,
      price: service.paraPrice,
      status: service.status || "available",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", price: "", status: "available" });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.name || !editForm.price) {
      toast.error("Tên và giá không được bỏ trống.");
      return;
    }

    try {
      await editMedicalService(id, {
        name: editForm.name,
        price: parseInt(editForm.price),
        status: editForm.status,
      });
      toast.success("Cập nhật dịch vụ thành công!");
      setEditingId(null);
      fetchServices();
    } catch (error) {
      toast.error("Lỗi khi cập nhật dịch vụ: " + error.message);
    }
  };

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
                  sx={{
                    alignItems: "flex-start",
                    px: 0,
                    flexDirection: "column",
                  }}
                >
                  {editingId === s._id ? (
                    <>
                      <TextField
                        fullWidth
                        label="Tên dịch vụ"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Giá (VNĐ)"
                        name="price"
                        type="number"
                        value={editForm.price}
                        onChange={handleEditChange}
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        select
                        fullWidth
                        label="Trạng thái hoạt động"
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        sx={{ mb: 1 }}
                      >
                        <MenuItem value="available">Đang hoạt động</MenuItem>
                        <MenuItem value="disable">Tạm dừng</MenuItem>
                      </TextField>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSaveEdit(s._id)}
                        sx={{ mr: 1 }}
                      >
                        Lưu
                      </Button>
                      <Button variant="text" size="small" onClick={handleCancelEdit}>
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <>
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
                      <Button
                        variant="text"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => handleEditClick(s)}
                      >
                        Cập nhật
                      </Button>
                    </>
                  )}
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
