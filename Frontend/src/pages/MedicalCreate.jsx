import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  createMedicalService,
  listService,
  editMedicalService,
} from "../services/medicalService";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  MenuItem,
} from "@mui/material";
import axios from "axios"; // Dùng để gọi API tìm kiếm

const MedicCreatePage = () => {
  const [form, setForm] = useState({ name: "", price: "", room: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    room: "",
    status: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    try {
      const res = await axios.get(
        `http://localhost:3000/api/service/search?name=${value}`
      );
      setServices(res.data.services);
    } catch (err) {
      toast.error("Không thể tìm kiếm dịch vụ: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMedicalService(form);
      setForm({ name: "", price: "", room: "" });
      setErrorMsg("");
      fetchServices();
    } catch (err) {
      toast.error("Lỗi tạo dịch vụ: " + (err?.response?.data?.message || err.message));
    }
  };

  const fetchServices = async () => {
    try {
      const data = await listService();
      setServices(data.services);
    } catch (error) {
      toast.error("Không thể tải danh sách dịch vụ.", error);
    }
  };

  const handleEditClick = (service) => {
    setEditingId(service._id);
    setEditForm({
      name: service.paraclinalName,
      price: service.paraPrice,
      room: service.roomNumber,
      status: service.status,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      await editMedicalService(editingId, {
        name: editForm.name,
        price: editForm.price,
        room: editForm.room,
        status: editForm.status,
      });
      setEditingId(null);
      setErrorMsg("");
      fetchServices();
    } catch (err) {
      toast.error("Lỗi khi cập nhật dịch vụ: " + (err?.response?.data?.message || err.message));
    }
  };

  const checkPermission = () => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== "admin") {
        alert("Bạn không có quyền truy cập trang này");
        navigate("/");
      }
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    checkPermission();
    fetchServices();
  }, []);

  return (
    <div className="">
    <Toaster position="top-right" richColors />
      {/* FORM TẠO DỊCH VỤ */}
      <section className="w-full">
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h5" gutterBottom>
            Tạo dịch vụ cận lâm sàng
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="name"
              label="Tên dịch vụ"
              margin="normal"
              value={form.name}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              name="price"
              label="Giá (VNĐ)"
              type="number"
              margin="normal"
              value={form.price}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              name="room"
              label="Phòng"
              margin="normal"
              value={form.room}
              onChange={handleChange}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              TẠO DỊCH VỤ
            </Button>
          </form>
          {errorMsg && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMsg}
            </Alert>
          )}
        </Paper>
      </section>

      {/* DANH SÁCH DỊCH VỤ + TÌM KIẾM */}
      <section className="mt-4">
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6" gutterBottom>
            Danh sách dịch vụ
          </Typography>

          <TextField
            label="Tìm kiếm theo tên"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            margin="normal"
          />

          {services.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Không tìm thấy dịch vụ nào.
            </Typography>
          ) : (
            <List sx={{ padding: 0 }}>
              {services.map((s, index) => (
                <React.Fragment key={s._id}>
                  <ListItem
                    sx={{ alignItems: "flex-start", px: 0, flexDirection: "column" }}
                  >
                    {editingId === s._id ? (
                      <>
                        <TextField
                          name="name"
                          label="Tên dịch vụ"
                          value={editForm.name}
                          onChange={handleEditChange}
                          fullWidth
                          margin="dense"
                        />
                        <TextField
                          name="price"
                          label="Giá (VNĐ)"
                          type="number"
                          value={editForm.price}
                          onChange={handleEditChange}
                          fullWidth
                          margin="dense"
                        />
                        <TextField
                          name="room"
                          label="Phòng"
                          value={editForm.room}
                          onChange={handleEditChange}
                          fullWidth
                          margin="dense"
                        />
                        <TextField
                          name="status"
                          label="Trạng thái"
                          value={editForm.status}
                          onChange={handleEditChange}
                          select
                          fullWidth
                          margin="dense"
                        >
                          <MenuItem value="available">Đang hoạt động</MenuItem>
                          <MenuItem value="disable">Tạm dừng</MenuItem>
                        </TextField>
                        <Box mt={1}>
                          <Button variant="contained" onClick={handleSaveEdit}>
                            Lưu
                          </Button>
                          <Button
                            sx={{ ml: 1 }}
                            onClick={() => setEditingId(null)}
                          >
                            Hủy
                          </Button>
                        </Box>
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
                                Giá: {s.paraPrice} VNĐ | Phòng: {s.roomNumber}
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
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => handleEditClick(s)}
                        >
                          Chỉnh sửa
                        </Button>
                      </>
                    )}
                  </ListItem>
                  {index < services.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </section>
    </div>
  );
};

export default MedicCreatePage;
