import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import AppRoute from "./config/routes";
import React from "react";
import StaffList from './pages/StaffListPage';
import AddStaff from './pages/StaffAddPage';
import UpdateStaff from './pages/StaffUpdatePage';
import StaffDetailPage from './pages/StaffDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyForgotPasswordPage from './pages/VerifyForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import NewsPage from './pages/NewsPage';
import ServicesPage from './pages/ServicesPage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import CreateMedical from './pages/MedicalCreate';
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/staff" element={<StaffList />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/staff/update" element={<UpdateStaff />} />
        <Route path="/staff/detail" element={<StaffDetailPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/specialties" element={<SpecialtiesPage />} />
        <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
        <Route path="/termsofservice" element={<TermsOfServicePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-forgot-password" element={<VerifyForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/google-auth-success" element={<GoogleAuthCallback />} />
        <Route path="/createMedical" element={<CreateMedical />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
