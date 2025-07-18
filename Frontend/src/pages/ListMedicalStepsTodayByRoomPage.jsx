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
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

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
    const [uploadedResults, setUploadedResults] = useState({}); // { [stepId]: true }
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [resultFiles, setResultFiles] = useState([]);
    const [diagnosis, setDiagnosis] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchTodaySteps = async () => {
            const steps = await stepProcessService.getTodayProcessStepsByRoom();
            setTodaySteps(steps);

            // Check for uploaded results for each step
            const resultStatus = {};
            await Promise.all(
                steps.map(async (step) => {
                    try {
                        const res = await MedicalHistoryService.getMedicalHistoryByStepId(step._id);
                        if (res && (Array.isArray(res) ? res.length > 0 : Object.keys(res).length > 0)) {
                            resultStatus[step._id] = true;
                        } else {
                            resultStatus[step._id] = false;
                        }
                    } catch (e) {
                        resultStatus[step._id] = false;
                        console.error(`Error checking result for step ${step._id}:`, e);
                    }
                })
            );
            setUploadedResults(resultStatus);
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

    const handleUploadResult = (service) => {
        setSelectedService(service);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedService(null);
        setResultFiles([]);
        setDiagnosis("");
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
            resultFiles: fileIds,
            patientId: selectedService.patient._id,
            processStep: selectedService._id,
        };

        try {
            await stepProcessService.updateProcessStepNotes(selectedService._id, diagnosis);
            await MedicalHistoryService.createMedicalHistory(payload);
            setUploadedResults(prev => ({
                ...prev,
                [selectedService._id]: true
            }));
            setSnackbar({ open: true, message: 'Tải lên kết quả thành công!', severity: 'success' });
            handleDialogClose();
        } catch (error) {
            console.error("Error uploading result:", error);
            setSnackbar({ open: true, message: 'Tải lên kết quả thất bại. Vui lòng thử lại sau.', severity: 'error' });
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
                            {service.isCompleted ? (
                                uploadedResults[service._id] ? (
                                    <Chip label="Đã tải lên kết quả" color="info" size="small" />
                                ) : (
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
                                )
                            ) : null}
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
                        <Button type="submit" variant="contained" disabled={resultFiles.length === 0}>Tải lên</Button>
                    </DialogActions>
                </form>
            </Dialog>
        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <MuiAlert elevation={6} variant="filled" severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </MuiAlert>
        </Snackbar>
        </Box>
    );
};

export default ListMedicalStepsTodayByRoomPage;