import { useState, useEffect } from 'react';
import socket from '../lib/socket';

import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  Autocomplete,
  Fade,
  Slide,
  Grow,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { PatientService } from '../services/patientService';
import { listService } from '../services/medicalService';
import { MedicalProcessService } from '../services/medicalProcessService';
import  appointmentService  from '../services/appointmentService';
import { getPaymentByAppointmentId, updatePayment } from '../services/paymentService';

const CreateMedicalProcessPage = () => {
  // State management with safe initial values
  const [doctor, setDoctor] = useState(null);
  const [appointmentsToday, setAppointmentsToday] = useState([]);
  const [services, setServices] = useState([]);
  const [appointmentInputValue, setAppointmentInputValue] = useState('');
  const [processStepsForm, setProcessStepsForm] = useState([{ id: 1, serviceId: '', notes: '' }]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on mount with error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [appointmentsTodayRes, servicesRes] = await Promise.all([
          appointmentService.getAppointmentsToday().catch(() => []), // Return empty array on error
          listService().catch(() => ({ services: [] })) // Return empty object with services array on error
        ]);
        
        // Safe data setting with null checks
        setAppointmentsToday(Array.isArray(appointmentsTodayRes) ? appointmentsTodayRes : []);
        setServices(Array.isArray(servicesRes?.services) ? servicesRes.services : []);

        // Doctor validation
        const doctorData = JSON.parse(sessionStorage.getItem('user') || 'null');
        if (!doctorData || doctorData.role !== 'doctor') {
          window.location.href = '/login';
          return;
        }
        setDoctor(doctorData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Lỗi khi tải dữ liệu', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện xác nhận lịch hẹn
    socket.on('appointment_confirmed', (confirmedAppointment) => {
      setAppointmentsToday(prev => {
        const exists = prev.some(appt => appt._id === confirmedAppointment._id);
        if (exists) {
          return prev.map(appt =>
            appt._id === confirmedAppointment._id ? confirmedAppointment : appt
          );
        } else {
          return [...prev, confirmedAppointment];
        }
      });
    });
    return () => {
      socket.off('appointment_confirmed');
    };
  }, []);

  useEffect(() => {
    // Khi danh sách appointmentsToday thay đổi, đồng bộ lại selectedAppointment nếu cần
    if (selectedAppointment) {
      const updated = appointmentsToday.find(appt => appt._id === selectedAppointment._id);
      if (updated && updated !== selectedAppointment) {
        setSelectedAppointment(updated);
      }
    }
    // eslint-disable-next-line
  }, [appointmentsToday]);

  // Helper functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Process steps management with null checks
  const addProcessStep = () => {
    const newId = processStepsForm.length > 0 
      ? Math.max(...processStepsForm.map(step => step.id || 0)) + 1 
      : 1;
    setProcessStepsForm([...processStepsForm, { id: newId, serviceId: '', notes: '' }]);
  };

  const removeProcessStep = (id) => {
    if (processStepsForm.length > 1) {
      setProcessStepsForm(processStepsForm.filter(step => step.id !== id));
    }
  };

  const handleStepChange = (id, field, value) => {
    setProcessStepsForm(processStepsForm.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  // Form submission with enhanced validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAppointment || !selectedAppointment._id || !selectedAppointment.patientId) {
      showSnackbar('Vui lòng chọn lịch hẹn hợp lệ', 'error');
      return;
    }

    if (processStepsForm.some(step => !step.serviceId)) {
      showSnackbar('Vui lòng chọn dịch vụ cho tất cả các bước', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create process steps with error handling
      const processStepPromises = processStepsForm.map((step, idx) => 
        MedicalProcessService.createProcessStep({
          serviceId: step.serviceId,
          notes: step.notes || '',
          patientId: selectedAppointment.patientId, // vẫn truyền patientId cho bước processStep nếu cần
          isFirstStep: idx === 0
        }).catch(error => {
          console.error('Error creating process step:', error);
          throw new Error('Failed to create one or more process steps');
        })
      );

      const createdSteps = await Promise.all(processStepPromises);
      const processStepIds = createdSteps.map(step => step?._id).filter(Boolean);

      if (processStepIds.length !== processStepsForm.length) {
        throw new Error('Some process steps failed to create');
      }

      // Create the main medical process
      await MedicalProcessService.createMedicalProcess({
        appointmentId: selectedAppointment._id,
        doctorId: doctor?._id || '',
        processSteps: processStepIds
      });
      const paymentData = await getPaymentByAppointmentId(selectedAppointment._id);
      
      const paymentUpdateData = {
        appointmentId: selectedAppointment._id,
        examinationFee: paymentData.examinationFee || 0,
        serviceFee: processStepsForm.map(step => ({
          serviceId: step.serviceId,
          fee: services.find(service => service._id === step.serviceId)?.paraPrice || 0
        })),
        methodExam: paymentData.methodExam || 'banking',
        methodService: paymentData.methodService || 'none',
      };

      await updatePayment(paymentData._id, paymentUpdateData);

      await appointmentService.updateAppointmentStatus(selectedAppointment._id, 'in-progress');


      showSnackbar('Tạo tiến trình khám thành công!');
      resetForm();
    } catch (error) {
      console.error('Error creating medical process:', error);
      showSnackbar(error.message || 'Có lỗi xảy ra khi tạo tiến trình khám', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProcessStepsForm([{ id: 1, serviceId: '', notes: '' }]);
    setSelectedAppointment(null);
    setAppointmentInputValue('');
  };

  // Loading state
  if (isLoading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Box className="max-w-3xl mx-auto">
        <Slide direction="down" in={true} mountOnEnter unmountOnExit>
          <Box className="text-center mb-8">
            <Typography variant="h4" className="font-bold text-gray-900" gutterBottom>
              Tạo Tiến Trình Khám
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Thiết lập các bước khám bệnh cho bệnh nhân
            </Typography>
          </Box>
        </Slide>
        
        <Fade in={true} timeout={800}>
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection with null checks */}
                <Box>
                  <Typography variant="subtitle1" className="font-medium text-gray-700 mb-2">
                    Lịch hẹn <span className="text-red-500">*</span>
                  </Typography>
                  <Autocomplete
                    options={appointmentsToday.filter(appt => appt.status === 'confirmed')}
                    getOptionLabel={(option) => option?.patientId?.fullName || 'Không xác định'}
                    inputValue={appointmentInputValue}
                    value={selectedAppointment}
                    onInputChange={(event, newInputValue) => {
                      setAppointmentInputValue(newInputValue || '');
                    }}
                    onChange={(event, newValue) => {
                      setSelectedAppointment(newValue || null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Tìm kiếm lịch hẹn..."
                        variant="outlined"
                        fullWidth
                        required
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon className="text-gray-400" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} className="hover:bg-blue-50">
                        <Box className="flex justify-between w-full">
                          <Typography>{option?.patientId?.fullName || 'Không xác định'}</Typography>
                          <Typography variant="body2" className="text-gray-500">
                            {option?.patientId?.phone || 'Không có số điện thoại'}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    PaperComponent={({ children }) => (
                      <Paper className="shadow-lg rounded-md mt-1">
                        {children}
                      </Paper>
                    )}
                    popupIcon={<ExpandMoreIcon className="text-gray-400" />}
                    noOptionsText="Không tìm thấy lịch hẹn"
                  />
                </Box>
                
                {/* Process Steps with null checks */}
                <Box>
                  <Box className="flex justify-between items-center mb-4">
                    <Typography variant="subtitle1" className="font-medium text-gray-700">
                      Các bước khám <span className="text-red-500">*</span>
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={addProcessStep}
                      className="shadow-sm"
                      disabled={isSubmitting}
                    >
                      Thêm bước
                    </Button>
                  </Box>
                  
                  <Box className="space-y-4">
                    {processStepsForm.map((step, index) => (
                      <Grow in={true} key={step.id || index}>
                        <Card 
                          variant="outlined" 
                          className="rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          <CardContent className="p-4">
                            <Box className="flex justify-between items-start mb-3">
                              <Typography variant="subtitle2" className="font-medium">
                                Bước {index + 1}
                              </Typography>
                              {processStepsForm.length > 1 && (
                                <IconButton
                                  size="small"
                                  onClick={() => removeProcessStep(step.id)}
                                  className="text-red-500 hover:text-red-700"
                                  disabled={isSubmitting}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            
                            <Box className="space-y-3">
                              <Box>
                                <Typography variant="body2" className="text-gray-700 mb-1">
                                  Dịch vụ <span className="text-red-500">*</span>
                                </Typography>
                                <Select
                                  value={step.serviceId || ''}
                                  onChange={(e) => handleStepChange(step.id, 'serviceId', e.target.value)}
                                  variant="outlined"
                                  fullWidth
                                  displayEmpty
                                  required
                                  className="bg-white"
                                  disabled={isSubmitting}
                                >
                                  <MenuItem value="" disabled>
                                    <em>Chọn dịch vụ...</em>
                                  </MenuItem>
                                  {Array.isArray(services) && services.map(service => (
                                    <MenuItem key={service?._id || index} value={service?._id || ''}>
                                      {service?.paraclinalName || 'Dịch vụ không xác định'} 
                                      {service?.room?.roomNumber ? ` (Phòng: ${service.room.roomNumber})` : ''}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </Box>
                              
                              <Box>
                                <Typography variant="body2" className="text-gray-700 mb-1">
                                  Ghi chú (tùy chọn)
                                </Typography>
                                <TextField
                                  value={step.notes || ''}
                                  onChange={(e) => handleStepChange(step.id, 'notes', e.target.value)}
                                  variant="outlined"
                                  fullWidth
                                  multiline
                                  rows={2}
                                  disabled={isSubmitting}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grow>
                    ))}
                  </Box>
                </Box>
                
                {/* Submit Button */}
                <Box className="pt-4">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    className="py-3 shadow-md hover:shadow-lg transition-all duration-300"
                    disabled={isSubmitting || !doctor}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Tạo Tiến Trình Khám'
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Fade>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateMedicalProcessPage;