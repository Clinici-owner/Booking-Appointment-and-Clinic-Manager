export const ROUTE_PATH = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_FORGOT_PASSWORD: '/verify-forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Public
  HOME: '/',
  ABOUT_US: '/aboutus',
  NEWS: '/news',
  SERVICES: '/services',
  SPECIALTIES: '/specialties',
  PRIVACY_POLICY: '/privacypolicy',
  TERMS_OF_SERVICE: '/termsofservice',

  //Admin Manage Staff
  STAFF_LIST: '/admin/staffs',
  ADD_STAFF: '/admin/staffs/add',
  UPDATE_STAFF: '/admin/staffs/update',
  STAFF_DETAIL: '/admin/staffs/detail',

  LIST_PATIENTS: '/admin/patients',
  PATIENT_DETAIL: '/admin/patient/detail',

  // OAuth callback
  GOOGLE_AUTH_CALLBACK: '/google-auth-success',

  // User-profile
  USER_PROFILE: '/user-profile',
  USER_PROFILE_UPDATE: '/user-profile/update',
  UPDATE_PASSWORD: '/user-profile/update-password',

  //Service manager
  SERVICES_CREATE: '/createMedical',  
  SERVICES_LIST: '/medical-services/list',
  //Specialty manager
  SPECIALTIES_LIST: '/admin/specialties',
  ADD_SPECIALTY: '/admin/specialties/add',
  UPDATE_SPECIALTY: '/admin/specialties/update/:id',
  SPECIALTY_DETAIL: '/admin/specialties/:id',

  //Specialty for user
  SPECIALTY_DETAIL_PATIENT: '/specialties/:id',

  //Schedule manager
  ADD_SCHEDULE: '/admin/schedules/add',
  OWN_SCHEDULE: '/schedules/own',
  ROOM_SCHEDULE: '/schedules/room',
  

  //Doctor
  DOCTOR_PROFILE_CREATE: '/doctor/createDoctorProfile',
  DOCTOR_CREATE_MEDICAL_PROCESS: '/doctor/createMedicalProcess',
  DOCTOR_ALL_MEDICAL_PROCESS: '/doctor/medicalProcess',
  DOCTOR_MEDICAL_PROCESS_DETAIL: '/doctor/medicalProcess/:processId',
  DOCTOR_PATIENT_MEDICAL_HISTORY_LIST: '/doctor/patient-medical-histories',
  DOCTOR_PATIENT_MEDICAL_HISTORY_DETAIL: '/doctor/patient-medical-history',
  DOCTOR_APPOINTMENT_LIST: '/doctor/appointment-list',

  //News manager
  CREATE_NEWS: '/admin/news',
  NEWS_PAPER:'/paper',
  NEWS_EDIT: '/admin/news/edit',


  //Health package manager
  HEALTH_PACKAGE_MANAGER: '/admin/health-packages',
  HEALTH_PACKAGE_CREATE: '/admin/health-packages/create',
  HEALTH_PACKAGE_UPDATE: '/admin/health-packages/edit/:id',
  HEALTH_PACKAGE_DETAIL: '/admin/health-packages/detail/:id',
  HEALTH_PACKAGE_lOCK_STATUS: '/admin/health-packages/lockstatus/:id',

  // Health package for user
  HEALTH_PACKAGE_USER: '/health-packages',
  HEALTH_PACKAGE_DETAIL_USER: '/health-packages/detail/:id',
  PACKAGE_LIST: '/health-package/list',

  //Doctor List for User
  DOCTOR_LIST: '/doctors',
  DOCTOR_DETAIL: '/doctors/:id', 

  //Appointment for patient
  APPOINTMENT_SPECIALTY: '/appointment-specialty/:id',
  HEALTH_PACKAGE_LIST: '/health-packages-list',
  APPOINTMENT_PAYMENT: '/appointment-payment',
  APPOINTMENT_PATIENT: '/appointment-patient',
  APPOINTMENT_DETAIL: '/appointment-patient/appointment-detail/:id',

  //Appointment for admin
  APPOINTMENT_ADMIN: '/admin/appointment-admin',


  //Appointment for receptionist
  APPOINTMENT_RECEPTIONIST: '/receptionist/appointment-receptionist',
  // 404
  NOT_FOUND: '*',

  //Technician
  TECHNICIAN_PROFILE_CREATE: '/technician/createTechnicianProfile',

  //Medical history
  LIST_MEDICAL_STEPS_TODAY_BY_ROOM: '/medical-process/steps/today',

  //Patient

  PATIENT_MY_PROCESS: '/MyProcess',

  //Patient for receptionist
  PATIENT_LIST: '/receptionist/patients',
  APPOINTMENT_BOOKING: '/receptionist/appointments',

  PATIENT_MY_MEDICAL_HISTORY: '/patient-medical-history',

};