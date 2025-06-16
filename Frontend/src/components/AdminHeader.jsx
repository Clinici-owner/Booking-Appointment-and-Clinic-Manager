import React from 'react';

const AdminHeader = () => {
  return (
    <header className="w-full border-b border-gray-200">
      <div className="flex items-center justify-end gap-8 py-4 px-6"> {/* tăng padding và gap */}
        <div className="relative">
          <button aria-label="Notifications" className="text-blue-600 text-xl focus:outline-none">
            <i className="fas fa-bell fa-xl"></i>
          </button>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
            6
          </span>
        </div>
        <div className="flex items-center gap-2.5 cursor-pointer select-none">
          <img
            alt="United Kingdom flag"
            className="w-7 h-5 object-cover rounded-sm"
            draggable="false"
            height="20"
            src="https://storage.googleapis.com/a1aa/image/289c21c5-8170-4bed-5f5d-7f0af84d8bf7.jpg"
            width="28"
          />
          <span className="text-gray-700 text-base font-normal">
            English
          </span>
          <i className="fas fa-chevron-down text-gray-400 text-sm"></i>
        </div>
        <div className="flex items-center gap-3 cursor-pointer select-none">
          <img
            alt="User avatar with pink hair and a headband"
            className="w-10 h-10 rounded-full object-cover"
            draggable="false"
            height="40"
            src="https://storage.googleapis.com/a1aa/image/038cfe25-7561-49c8-6475-69f63dbf6543.jpg"
            width="40"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-gray-900 text-base font-semibold">
              Moni Roy
            </span>
            <span className="text-gray-500 text-sm font-normal">
              Admin
            </span>
          </div>
          <i className="fas fa-chevron-down text-gray-400 text-sm"></i>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
