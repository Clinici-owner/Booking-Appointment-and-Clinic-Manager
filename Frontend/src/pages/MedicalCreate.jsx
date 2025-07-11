import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  getSpecialties,
  createMedicalService,
  getRoomsBySpecialty
} from "../services/medicalService";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  MenuItem
} from "@mui/material";

const MedicCreatePage = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    room: "",
    specialty: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/");
    }
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const fetchSpecialties = async () => {
    try {
      const data = await getSpecialties();
      setSpecialties(data);
    } catch (error) {
      toast.error("Không thể tải danh sách chuyên khoa: " + error.message, {
        id: "fetch-specialty-error"
      });
    }
  };

  useEffect(() => {
    const fetchRoomsBySpecialty = async () => {
      if (!form.specialty) {
        setAvailableRooms([]);
        return;
      }
      setLoading(true);
      try {
        const res = await getRoomsBySpecialty(form.specialty);
        setAvailableRooms(Array.isArray(res) ? res : []);
      } catch (error) {
        setAvailableRooms([]);
        toast.error("Không thể tải phòng theo chuyên khoa: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomsBySpecialty();
  }, [form.specialty]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSpecialties();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.room || !form.specialty) {
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
        specialty: ""
      });
      navigate("/medical-services/list");
    } catch (err) {
      toast.error(
        "Lỗi tạo dịch vụ: " + (err?.response?.data?.message || err.message)
      );
    }
  };

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
              name="specialty"
              label="Chuyên khoa"
              margin="normal"
              value={form.specialty}
              onChange={handleChange}
            >
              {specialties.length > 0 ? (
                specialties.map((sp) => (
                  <MenuItem key={sp._id} value={sp._id}>
                    {sp.specialtyName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Không có chuyên khoa</MenuItem>
              )}
            </TextField>

            <TextField
              select
              fullWidth
              name="room"
              label="Phòng"
              margin="normal"
              value={form.room}
              onChange={handleChange}
              disabled={loading || !form.specialty}
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
                <MenuItem disabled>Không có phòng cho chuyên khoa này</MenuItem>
              )}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
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
