import React from "react";
import { ROUTE_PATH } from "../constants/routePath";
import MainLayout from "../layouts/main-layout";

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

const GoogleAuthCallback = React.lazy(() => import("../components/GoogleAuthCallback"));

const NotFoundPage = React.lazy(() => import("../pages/NotFoundPage"));

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
  { path: ROUTE_PATH.STAFF_LIST, page: StaffListPage, layout: MainLayout },
  { path: ROUTE_PATH.ADD_STAFF, page: AddStaffPage, layout: MainLayout },
  { path: ROUTE_PATH.UPDATE_STAFF, page: UpdateStaffPage, layout: MainLayout },
  { path: ROUTE_PATH.STAFF_DETAIL, page: StaffDetailPage, layout: MainLayout },

  // OAuth callback
  { path: ROUTE_PATH.GOOGLE_AUTH_CALLBACK, page: GoogleAuthCallback },

  //404 Not Found
  { path: ROUTE_PATH.NOT_FOUND, page: NotFoundPage },
];

export default AppRoute;
