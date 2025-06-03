import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import StaffList from './pages/StaffListPage';
import AddStaff from './pages/AddStaffPage';
import UpdateStaff from './pages/UpdateStaffPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/staff" element={<StaffList />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/staff/update/:id" element={<UpdateStaff />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
