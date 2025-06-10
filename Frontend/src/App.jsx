import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

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

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/staff" element={<StaffList />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/staff/update" element={<UpdateStaff />} />
        <Route path="/staff/detail" element={<StaffDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-forgot-password" element={<VerifyForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
