import { NavLink } from 'react-router-dom';
import React from 'react';
import Logo from '../assets/images/LogoMini.png'; 

function AdminNavSidebar() {
  return (
    <div className="w-64 min-h-screen border-r border-gray-200 flex flex-col">
      <div className="px-5 py-8">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-md py-3.5 flex items-center justify-center gap-2"
          type="button"
        >
          <i className="far fa-clock text-white text-sm"></i>
          <span>Dashboard</span>
        </button>
      </div>
      <nav className="mt-6 flex flex-col gap-5 px-5">
        <NavLink to="/staff" className="flex items-center gap-3 text-gray-900 text-base font-medium" activeClassName="text-blue-600">
          <i className="fas fa-user-friends text-lg"></i>
          Manage Staffs
        </NavLink>
        <NavLink to="/medical-service" className="flex items-center gap-3 text-gray-900 text-base font-medium" activeClassName="text-blue-600">
          <i className="fas fa-th-large text-lg"></i>
          Manage Medical Service
        </NavLink>
        <NavLink to="/schedule" className="flex items-center gap-3 text-gray-900 text-base font-medium" activeClassName="text-blue-600">
          <i className="fas fa-list-ul text-lg"></i>
          Manage Schedule Staff
        </NavLink>
        <NavLink to="/service-package" className="flex items-center gap-3 text-gray-900 text-base font-medium" activeClassName="text-blue-600">
          <i className="fas fa-th-large text-lg"></i>
          Manage Service Package
        </NavLink>
        <NavLink to="/logout" className="flex items-center gap-3 text-gray-900 text-base font-medium" activeClassName="text-blue-600">
          <i className="fas fa-power-off text-lg"></i>
          Logout
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminNavSidebar;
