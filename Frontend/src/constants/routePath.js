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
  SCHEDULE_LIST: '/admin/schedules',
  ADD_SCHEDULE: '/admin/schedules/add',
  UPDATE_SCHEDULE: '/admin/schedules/update',
  SCHEDULE_DETAIL: '/admin/schedules/detail',
  OWN_SCHEDULE: '/schedules/own',
  

  //Doctor
  DOCTOR_PROFILE_CREATE: '/doctor/createDoctorProfile',
  DOCTOR_CREATE_MEDICAL_PROCESS: '/doctor/createMedicalProcess',
  DOCTOR_ALL_MEDICAL_PROCESS: '/doctor/medicalProcess',
  DOCTOR_MEDICAL_PROCESS_DETAIL: '/doctor/medicalProcess/:processId',

  //News manager
  CREATE_NEWS: '/admin/news',

  //Health package manager
  HEALTH_PACKAGE_MANAGER: '/admin/health-packages',
  HEALTH_PACKAGE_CREATE: '/admin/health-packages/create',
  HEALTH_PACKAGE_UPDATE: '/admin/health-packages/edit/:id',
  HEALTH_PACKAGE_DETAIL: '/admin/health-packages/detail/:id',
  HEALTH_PACKAGE_lOCK_STATUS: '/admin/health-packages/lockstatus/:id',

  // Health package for user
  HEALTH_PACKAGE_USER: '/health-packages',
  HEALTH_PACKAGE_LIST: '/health-packages-list',
  // 404
  NOT_FOUND: '*',

  //Technician
  TECHNICIAN_PROFILE_CREATE: '/technician/createTechnicianProfile',
};