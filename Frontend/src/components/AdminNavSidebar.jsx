import { NavLink } from 'react-router-dom';
import React from 'react';
import Logo from '../assets/images/LogoMini.png'; 

function AdminNavSidebar() {
  return (
    <div className="w-64 min-h-screen border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-4 py-6 px-5">
        <img
          alt="Logo with red and blue colors and letters R and P"
          className="w-14 h-14 rounded-full"
          height="56"
          src={Logo}
          width="56"
        />
        <div className="flex flex-col leading-tight">
          <p className="text-blue-600 font-semibold text-base leading-none">Phòng khám</p>
          <p className="text-red-600 font-extrabold text-2xl leading-none">Phúc Hưng</p>
        </div>
      </div>
      <div className="px-5">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-md py-3.5 flex items-center justify-center gap-2"
          type="button"
        >
          <i className="far fa-clock text-white text-sm"></i>
          <span>Dashboard</span>
        </button>
      </div>
      <nav className="mt-6 flex flex-col gap-5 px-5">
        <a className="flex items-center gap-3 text-gray-900 text-base font-medium" href="#">
          <i className="fas fa-user-friends text-lg"></i>
          Manage Staffs
        </a>
        <a className="flex items-center gap-3 text-gray-900 text-base font-medium" href="#">
          <i className="fas fa-th-large text-lg"></i>
          Manage Medical Service
        </a>
        <a className="flex items-center gap-3 text-gray-900 text-base font-medium" href="#">
          <i className="fas fa-list-ul text-lg"></i>
          Manage Schedule Staff
        </a>
        <a className="flex items-center gap-3 text-gray-900 text-base font-medium" href="#">
          <i className="fas fa-th-large text-lg"></i>
          Manage Service Package
        </a>
        <a className="flex items-center gap-3 text-gray-900 text-base font-medium" href="#">
          <i className="fas fa-power-off text-lg"></i>
          Logout
        </a>
      </nav>
    </div>
  );
};

export default AdminNavSidebar;
