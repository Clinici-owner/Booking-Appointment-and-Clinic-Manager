import React from "react";
import { ROUTE_PATH } from "../constants/routePath";
import MainLayout from "../layouts/main-layout";
import AdminLayout from "../layouts/admin-layout";

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

const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));

const UpdatepasswordPage = React.lazy(() => import("../pages/UpdatePasswordPage"));

const CreateDoctorProfilePage = React.lazy(() => import("../pages/CreateDoctorProfilePage"));
const CreateMedicalProcessPage = React.lazy(() => import("../pages/CreateMedicalProcessPage"));

const createNewspage = React.lazy(() => import("../pages/createNews"));


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

  //Service Manager
  {path: ROUTE_PATH.SERVICES_LIST, page: CreateMedical, layout: AdminLayout},

  // Specialty Manager
  { path: ROUTE_PATH.SPECIALTIES_LIST, page: SpecialtiesListPage, layout: AdminLayout },
  { path: ROUTE_PATH.ADD_SPECIALTY, page: AddSpecialtyPage, layout: AdminLayout },
  // { path: ROUTE_PATH.UPDATE_SPECIALTY, page: UpdateSpecialtyPage, layout: AdminLayout },
  { path: ROUTE_PATH.SPECIALTY_DETAIL, page: SpecialtyDetailPage, layout: AdminLayout },

  // Doctor
  { path: ROUTE_PATH.DOCTOR_PROFILE_CREATE, page: CreateDoctorProfilePage },
  { path: ROUTE_PATH.DOCTOR_CREATE_MEDICAL_PROCESS, page: CreateMedicalProcessPage },

  //News Manager 
  {path: ROUTE_PATH.CREATE_NEWS, page: createNewspage, layout: AdminLayout},

  //404 Not Found
  { path: ROUTE_PATH.NOT_FOUND, page: NotFoundPage },
];

export default AppRoute;
