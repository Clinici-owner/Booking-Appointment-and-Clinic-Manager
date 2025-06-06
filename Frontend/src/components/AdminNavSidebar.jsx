import { NavLink } from 'react-router-dom';

function AdminNavSidebar() {
  return (
    <div className="w-[230px] bg-[#0077b6] text-white h-screen p-5 flex flex-col fixed left-0 top-0 font-sans">
      <nav className="flex flex-col gap-3">
        {[
          { to: '/staff', label: ' Quản lý nhân viên' },
          { to: '/patients', label: 'Quản lý bệnh nhân' },
          { to: '/appointments', label: 'Quản lý lịch hẹn' },
          { to: '/services', label: 'Dịch vụ khám' },
          { to: '/reports', label: 'Báo cáo' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `no-underline font-medium py-2 px-4 rounded-md transition duration-200 w-full text-left whitespace-nowrap ${isActive ? 'bg-[#023e8a]' : 'hover:bg-[#023e8a]'}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AdminNavSidebar;
