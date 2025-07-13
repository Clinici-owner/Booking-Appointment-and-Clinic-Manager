import React, { useState, useEffect } from "react";

import stepProcessService from "../services/stepProcess";
import { UserService } from "../services/userService";
import { uploadToCloudinary } from "../services/documentUploadService";
import { uploadDocument } from "../services/documentUploadService";
import { MedicalHistoryService } from "../services/medicalHistoryService";

import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip
} from "@mui/material";

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const ListMedicalStepsTodayByRoomPage = () => {

    const [todaySteps, setTodaySteps] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [resultFiles, setResultFiles] = useState([]);
    const [diagnosis, setDiagnosis] = useState("");

    useEffect(() => {
        // Giả lập gọi API để lấy danh sách dịch vụ y tế hôm nay
        const fetchTodaySteps = async () => {
            const steps = await stepProcessService.getTodayProcessStepsByRoom();
            setTodaySteps(steps);
        };

        fetchTodaySteps();
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };


    // Lấy danh sách bác sĩ khi mở dialog
    const fetchDoctors = async () => {
        const doctorsData = await UserService.getAllDoctors();
        if (doctorsData && Array.isArray(doctorsData)) {
            setDoctors(doctorsData);
      }
    };

    const handleUploadResult = (service) => {
        setSelectedService(service);
        setOpenDialog(true);
        fetchDoctors();
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedService(null);
        setSelectedDoctor("");
        setResultFiles([]);
        setDiagnosis("");
    };

    const handleDoctorChange = (event) => {
        setSelectedDoctor(event.target.value);
    };

    const handleFileChange = (event) => {
        setResultFiles(Array.from(event.target.files));
    };

    const handleRemoveFile = (idxToRemove) => {
        setResultFiles((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    };

    const handleDialogSubmit = async(event) => {
        event.preventDefault();
        let fileIds = [];

        if (resultFiles.length > 0) {
            const uploadPromises = resultFiles.map(file => uploadToCloudinary(file)
                .then(url => uploadDocument(url))
                .then(doc => doc.document._id)
            );
            fileIds = await Promise.all(uploadPromises);
        }

        const payload = {
            doctorId: selectedDoctor,
            resultFiles: fileIds,
            patientId: selectedService.patient._id,
            processStep: selectedService._id,
        };

        try {
            await stepProcessService.updateProcessStepNotes(selectedService._id, diagnosis);
            await MedicalHistoryService.createMedicalHistory(payload);
            alert("Tải lên kết quả thành công!");
            handleDialogClose();
        } catch (error) {
            console.error("Error uploading result:", error);
            alert("Tải lên kết quả thất bại. Vui lòng thử lại sau.");
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Danh sách dịch vụ y tế
            </Typography>
            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }} aria-label="medical services table">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Bệnh nhân</TableCell>
                            <TableCell>Dịch vụ</TableCell>
                            <TableCell>Phòng</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Ngày khám</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {todaySteps.map((service) => (
                            <TableRow key={service._id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar
                                            src={service.patient.avatar}
                                            alt={service.patient.fullName}
                                            sx={{ mr: 2 }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2">{service.patient.fullName}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {service.patient.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography>{service.serviceId.paraclinalName}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography>{service.serviceId.room.roomName}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Phòng {service.serviceId.room.roomNumber}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {service.isCompleted ? (
                                        <Chip
                                            label="Hoàn thành"
                                            color="success"
                                            size="small"
                                        />
                                    ) : (
                                        <Chip
                                            label="Chưa hoàn thành"
                                            color="error"
                                            size="small"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {formatDate(service.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <button
                                        style={{
                                            background: '#1976d2',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 4,
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                        onClick={() => handleUploadResult(service)}
                                    >
                                        Tải lên kết quả
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog upload kết quả */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>Tải lên kết quả</DialogTitle>
                <form onSubmit={handleDialogSubmit}>
                    <DialogContent>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="doctor-select-label">Chọn bác sĩ</InputLabel>
                            <Select
                                labelId="doctor-select-label"
                                value={selectedDoctor}
                                label="Chọn bác sĩ"
                                onChange={handleDoctorChange}
                                required
                            >
                                {doctors.map((doc) => (
                                    <MenuItem key={doc._id} value={doc._id}>{doc.fullName} - {doc.email}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Chuẩn đoán"
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                            multiline
                            minRows={2}
                            required
                        />
                        <Box mt={2}>
                            <Button variant="contained" component="label" fullWidth>
                                Tải file ảnh kết quả
                                <input type="file" accept="image/*" hidden multiple onChange={handleFileChange} required />
                            </Button>
                            {resultFiles.length > 0 && (
                                <Box mt={2} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    {resultFiles.map((file, idx) => {
                                        const url = URL.createObjectURL(file);
                                        return (
                                            <Box key={idx} sx={{ textAlign: 'center', position: 'relative' }}>
                                                <img
                                                    src={url}
                                                    alt={file.name}
                                                    style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, marginBottom: 4, border: '1px solid #eee' }}
                                                />
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="contained"
                                                    sx={{ position: 'absolute', top: 4, right: 4, minWidth: 0, width: 24, height: 24, p: 0, fontSize: 16, lineHeight: 1 }}
                                                    onClick={() => handleRemoveFile(idx)}
                                                    title="Hủy ảnh này"
                                                >
                                                    ×
                                                </Button>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>{file.name}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>Hủy</Button>
                        <Button type="submit" variant="contained" disabled={!selectedDoctor || resultFiles.length === 0}>Tải lên</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ListMedicalStepsTodayByRoomPage;