import { useState, useEffect } from 'react';
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

const CreateMedicalProcessPage = () => {
  // State management
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [patientInputValue, setPatientInputValue] = useState('');
  const [processStepsForm, setProcessStepsForm] = useState([{ id: 1, serviceId: '', notes: '' }]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, servicesRes] = await Promise.all([
          PatientService.getAllPatients(),
          listService()
        ]);
        
        setPatients(patientsRes || []);
        setServices(servicesRes.services || []);

        const doctorData = JSON.parse(sessionStorage.getItem('user'));
        if (doctorData) {
          setDoctor(doctorData);
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Lỗi khi tải dữ liệu', 'error');
      }
    };
    
    fetchData();
  }, []);

  // Helper functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Process steps management
  const addProcessStep = () => {
    const newId = processStepsForm.length > 0 
      ? Math.max(...processStepsForm.map(step => step.id)) + 1 
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

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!selectedPatient) {
        showSnackbar('Vui lòng chọn bệnh nhân', 'error');
        return;
      }

      if (processStepsForm.some(step => !step.serviceId)) {
        showSnackbar('Vui lòng chọn dịch vụ cho tất cả các bước', 'error');
        return;
      }

      // Create process steps and collect their IDs
      const processStepPromises = processStepsForm.map(step => 
        MedicalProcessService.createProcessStep({
          serviceId: step.serviceId,
          notes: step.notes
        })
      );

      const createdSteps = await Promise.all(processStepPromises);
      const processStepIds = createdSteps.map(step => step._id);

      // Create the main medical process
      await MedicalProcessService.createMedicalProcess({
        patientId: selectedPatient._id,
        doctorId: doctor._id,
        processSteps: processStepIds
      });

      // Success handling
      showSnackbar('Tạo tiến trình khám thành công!');
      resetForm();
    } catch (error) {
      console.error('Error creating medical process:', error);
      showSnackbar('Có lỗi xảy ra khi tạo tiến trình khám', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProcessStepsForm([{ id: 1, serviceId: '', notes: '' }]);
    setSelectedPatient(null);
    setPatientInputValue('');
  };

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
                {/* Patient Selection */}
                <Box>
                  <Typography variant="subtitle1" className="font-medium text-gray-700 mb-2">
                    Bệnh nhân <span className="text-red-500">*</span>
                  </Typography>
                  <Autocomplete
                    options={patients}
                    getOptionLabel={(option) => option.fullName}
                    inputValue={patientInputValue}
                    value={selectedPatient}
                    onInputChange={(event, newInputValue) => {
                      setPatientInputValue(newInputValue);
                    }}
                    onChange={(event, newValue) => {
                      setSelectedPatient(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Tìm kiếm bệnh nhân..."
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
                          <Typography>{option.fullName}</Typography>
                          <Typography variant="body2" className="text-gray-500">
                            {option.phone}
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
                    noOptionsText="Không tìm thấy bệnh nhân"
                  />
                </Box>
                
                {/* Process Steps */}
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
                      <Grow in={true} key={step.id}>
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
                                  value={step.serviceId}
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
                                  {services.map(service => (
                                    <MenuItem key={service._id} value={service._id}>
                                      {service.paraclinalName} (Phòng: {service.roomNumber})
                                    </MenuItem>
                                  ))}
                                </Select>
                              </Box>
                              
                              <Box>
                                <Typography variant="body2" className="text-gray-700 mb-1">
                                  Ghi chú (tùy chọn)
                                </Typography>
                                <TextField
                                  value={step.notes}
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
                    disabled={isSubmitting}
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