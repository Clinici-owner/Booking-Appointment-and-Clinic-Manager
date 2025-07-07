import React from "react";
import { ROUTE_PATH } from "../constants/routePath";
import MainLayout from "../layouts/main-layout";
import AdminLayout from "../layouts/admin-layout";
import DoctorLayout from "../layouts/doctor-layout";
import TechnicianLayout from "../layouts/technician-layout";

// Lazy load các trang
const HomePage = React.lazy(() => import("../pages/HomePage"));
const AboutUsPage = React.lazy(() => import("../pages/AboutUsPage"));
const NewsPage = React.lazy(() => import("../pages/NewsPage"));
const ServicesPage = React.lazy(() => import("../pages/ServicesPage"));
const SpecialtiesPage = React.lazy(() => import("../pages/SpecialtiesPage"));
const PrivacyPolicyPage = React.lazy(() => import("../pages/PrivacyPolicyPage"));
const TermsOfServicePage = React.lazy(() => import("../pages/TermsOfServicePage"));

const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const OTPVerifyPage = React.lazy(() => import("../pages/VerifyPage"));
const ForgotPasswordPage = React.lazy(() => import("../pages/ForgotPasswordPage"));
const VerifyForgotPasswordPage = React.lazy(() => import("../pages/VerifyForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("../pages/ResetPasswordPage"));

const StaffListPage = React.lazy(() => import("../pages/StaffListPage"));
const AddStaffPage = React.lazy(() => import("../pages/StaffAddPage"));
const UpdateStaffPage = React.lazy(() => import("../pages/StaffUpdatePage"));
const StaffDetailPage = React.lazy(() => import("../pages/StaffDetailPage"));
const ListPatientsPage = React.lazy(() => import("../pages/ListPatientPage"));
const PatientDetailPage = React.lazy(() => import("../pages/PatientDetailPage"));

const GoogleAuthCallback = React.lazy(() => import("../components/GoogleAuthCallback"));

const UserProfilePage = React.lazy(() => import("../pages/UserProfilePage"));
const UserProfileUpdatePage = React.lazy(() => import("../pages/UserProfileUpdatePage"));

const CreateMedical = React.lazy(() => import("../pages/MedicalCreate"))

const SpecialtiesListPage = React.lazy(() => import("../pages/SpecialtyListPage"));
const SpecialtyDetailPage = React.lazy(() => import("../pages/SpecialtyDetailPage"));
const AddSpecialtyPage = React.lazy(() => import("../pages/SpecialtyAddPage"));
const UpdateSpecialtyPage = React.lazy(() => import("../pages/SpecialtyAddPage")); 

const SpecialtyDetailPatientPage = React.lazy(() => import("../pages/SpecialtyDetailPatientPage"));

const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));
const HealthPackagePage = React.lazy(() => import("../pages/HealthPackagePage"));
const AdminHealthPackagePage = React.lazy(() => import("../pages/AdminHealthPackagePage"));
const CreateHealthPackagePage = React.lazy(() => import("../pages/CreateHealthPackagePage"));
const AdminHealthPackageDetailPage = React.lazy(() => import("../pages/AdminHealthPackageDetailPage"));
const UpdateHealthPackagePage = React.lazy(() => import("../pages/UpdateHealthPackagePage"));
const LockHealthPackagePage = React.lazy(() => import("../pages/LockHealthPackagePage"));
const UpdatepasswordPage = React.lazy(() => import("../pages/UpdatePasswordPage"));

const CreateDoctorProfilePage = React.lazy(() => import("../pages/CreateDoctorProfilePage"));
const CreateMedicalProcessPage = React.lazy(() => import("../pages/CreateMedicalProcessPage"));
const MedicalProcessListPage = React.lazy(() => import("../pages/MedicalProcessListPage"));
const MedicalProcessDetailPage = React.lazy(() => import("../pages/MedicalProcessDetailPage"));

const CreateNewspage = React.lazy(() => import("../pages/CreateNews"));

const ScheduleListPage = React.lazy(() => import("../pages/ScheduleListPage"));
const ScheduleDetailPage = React.lazy(() => import("../pages/ScheduleDetailPage"));
const ScheduleOwnPage = React.lazy(() => import("../pages/ScheduleOwnPage"));
const ScheduleAddPage = React.lazy(() => import("../pages/ScheduleAddPage"));
const ScheduleUpdatePage = React.lazy(() => import("../pages/ScheduleUpdatePage"));

const HealthPackageList = React.lazy(() => import("../pages/HealthPackageList"));

const CreateTechnicianProfilePage = React.lazy(() => import("../pages/CreateTechnicianProfilePage"));

// Cấu hình route
const AppRoute = [
  // Public
  { path: ROUTE_PATH.HOME, page: HomePage, layout: MainLayout },
  { path: ROUTE_PATH.ABOUT_US, page: AboutUsPage, layout: MainLayout },
  { path: ROUTE_PATH.NEWS, page: NewsPage, layout: MainLayout },
  { path: ROUTE_PATH.SERVICES, page: ServicesPage, layout: MainLayout },
  { path: ROUTE_PATH.SPECIALTIES, page: SpecialtiesPage, layout: MainLayout },
  { path: ROUTE_PATH.PRIVACY_POLICY, page: PrivacyPolicyPage, layout: MainLayout },
  { path: ROUTE_PATH.TERMS_OF_SERVICE, page: TermsOfServicePage, layout: MainLayout },

  // Auth
  { path: ROUTE_PATH.LOGIN, page: LoginPage },
  { path: ROUTE_PATH.REGISTER, page: RegisterPage },
  { path: ROUTE_PATH.VERIFY, page: OTPVerifyPage },
  { path: ROUTE_PATH.FORGOT_PASSWORD, page: ForgotPasswordPage },
  { path: ROUTE_PATH.VERIFY_FORGOT_PASSWORD, page: VerifyForgotPasswordPage },
  { path: ROUTE_PATH.RESET_PASSWORD, page: ResetPasswordPage },

  // Staff
  { path: ROUTE_PATH.STAFF_LIST, page: StaffListPage, layout: AdminLayout },
  { path: ROUTE_PATH.ADD_STAFF, page: AddStaffPage, layout: AdminLayout },
  { path: ROUTE_PATH.UPDATE_STAFF, page: UpdateStaffPage, layout: AdminLayout },
  { path: ROUTE_PATH.STAFF_DETAIL, page: StaffDetailPage, layout: AdminLayout },
  { path: ROUTE_PATH.LIST_PATIENTS, page: ListPatientsPage, layout: AdminLayout },
  { path: ROUTE_PATH.PATIENT_DETAIL, page: PatientDetailPage, layout: AdminLayout },

  // OAuth callback
  { path: ROUTE_PATH.GOOGLE_AUTH_CALLBACK, page: GoogleAuthCallback },

  // User Profile
  { path: ROUTE_PATH.USER_PROFILE, page: UserProfilePage, layout: MainLayout },
  { path: ROUTE_PATH.USER_PROFILE_UPDATE, page: UserProfileUpdatePage, layout: MainLayout },
  { path: ROUTE_PATH.UPDATE_PASSWORD, page: UpdatepasswordPage, layout: MainLayout },
  // Admin Manage Health Package
  {path: ROUTE_PATH.HEALTH_PACKAGE_MANAGER, page: AdminHealthPackagePage, layout: AdminLayout},
  {path: ROUTE_PATH.HEALTH_PACKAGE_CREATE, page: CreateHealthPackagePage, layout: AdminLayout},
  {path: ROUTE_PATH.HEALTH_PACKAGE_DETAIL, page: AdminHealthPackageDetailPage, layout: AdminLayout},
  {path: ROUTE_PATH.HEALTH_PACKAGE_UPDATE, page: UpdateHealthPackagePage, layout: AdminLayout},
  {path: ROUTE_PATH.HEALTH_PACKAGE_lOCK_STATUS, page: LockHealthPackagePage, layout: AdminLayout},
  //Health package for user
  {path: ROUTE_PATH.HEALTH_PACKAGE_USER, page: HealthPackagePage, layout: MainLayout},
  //Service Manager
  {path: ROUTE_PATH.SERVICES_LIST, page: CreateMedical, layout: AdminLayout},

  // Specialty Manager
  { path: ROUTE_PATH.SPECIALTIES_LIST, page: SpecialtiesListPage, layout: AdminLayout },
  { path: ROUTE_PATH.ADD_SPECIALTY, page: AddSpecialtyPage, layout: AdminLayout },
  { path: ROUTE_PATH.UPDATE_SPECIALTY, page: UpdateSpecialtyPage, layout: AdminLayout },
  { path: ROUTE_PATH.SPECIALTY_DETAIL, page: SpecialtyDetailPage, layout: AdminLayout },

  // Specialty for user
  { path: ROUTE_PATH.SPECIALTY_DETAIL_PATIENT, page: SpecialtyDetailPatientPage, layout: MainLayout },
  
  // Schedule Manager
  { path: ROUTE_PATH.SCHEDULE_LIST, page: ScheduleListPage, layout: AdminLayout },
  { path: ROUTE_PATH.SCHEDULE_DETAIL, page: ScheduleDetailPage, layout: AdminLayout },
  { path: ROUTE_PATH.OWN_SCHEDULE, page: ScheduleOwnPage, layout: AdminLayout },
  { path: ROUTE_PATH.ADD_SCHEDULE, page: ScheduleAddPage, layout: AdminLayout },
  { path: ROUTE_PATH.UPDATE_SCHEDULE, page: ScheduleUpdatePage, layout: AdminLayout },

  // Doctor
  { path: ROUTE_PATH.DOCTOR_PROFILE_CREATE, page: CreateDoctorProfilePage, layout: DoctorLayout },
  { path: ROUTE_PATH.DOCTOR_CREATE_MEDICAL_PROCESS, page: CreateMedicalProcessPage, layout: DoctorLayout },
  { path: ROUTE_PATH.DOCTOR_ALL_MEDICAL_PROCESS, page: MedicalProcessListPage, layout: DoctorLayout },
  { path: ROUTE_PATH.DOCTOR_MEDICAL_PROCESS_DETAIL, page: MedicalProcessDetailPage, layout: DoctorLayout },

  // Technician
  { path: ROUTE_PATH.TECHNICIAN_PROFILE_CREATE, page: CreateTechnicianProfilePage, layout: TechnicianLayout },

  //Booking from package

  { path: ROUTE_PATH.PACKAGE_LIST, page: HealthPackageList },

 


  //Booking from package

  { path: ROUTE_PATH.PACKAGE_LIST, page: HealthPackageList },

 

  //News Manager 
  {path: ROUTE_PATH.CREATE_NEWS, page: CreateNewspage, layout: AdminLayout},

  //404 Not Found
  { path: ROUTE_PATH.NOT_FOUND, page: NotFoundPage },

  
];

export default AppRoute;
