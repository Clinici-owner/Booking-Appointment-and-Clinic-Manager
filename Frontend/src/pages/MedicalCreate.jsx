import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { getAvailableRooms } from "../services/medicalService";  
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Paper,
  MenuItem,
} from "@mui/material";
import { createMedicalService } from "../services/medicalService";

const MedicCreatePage = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    room: "",  // Không cần specialty nữa
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);  // Khởi tạo là mảng rỗng
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const rooms = await getAvailableRooms();
      if (Array.isArray(rooms) && rooms.length > 0) {
        setAvailableRooms(rooms);
      } else {
        setAvailableRooms([]);
        toast.error("Tất cả các phòng đã được sử dụng hết.");
      }
    } catch (error) {
      setAvailableRooms([]);
      toast.error("Không thể tải danh sách phòng: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.room) {  // Không cần kiểm tra specialty
      setErrorMsg("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setErrorMsg("");
    try {
      await createMedicalService(form);
      toast.success("Tạo dịch vụ thành công");
      setForm({
        name: "",
        price: "",
        room: "",
      });
      navigate("/medical-services/list");
    } catch (err) {
      toast.error("Lỗi tạo dịch vụ: " + (err?.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="w-full">
      <Toaster position="top-right" richColors />
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
              select
              fullWidth
              name="room"
              label="Phòng"
              margin="normal"
              value={form.room}
              onChange={handleChange}
              disabled={availableRooms.length === 0 || loading}
            >
              {loading ? (
                <MenuItem disabled>Đang tải phòng...</MenuItem>
              ) : availableRooms.length > 0 ? (
                availableRooms.map((room) => (
                  <MenuItem key={room._id} value={room._id}>
                    {room.roomNumber} - {room.roomName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Không có phòng khả dụng</MenuItem>
              )}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={availableRooms.length === 0 || loading}
            >
              TẠO DỊCH VỤ
            </Button>
          </form>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate("/medical-services/list")}
          >
            Xem Danh Sách Dịch Vụ
          </Button>
          {errorMsg && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMsg}
            </Alert>
          )}
        </Paper>
      </section>
    </div>
  );
};

export default MedicCreatePage;
