import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiBell, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import logo from '../../assets/img1.jpeg';

const Sidebar = ({ links, isOpen, onClose }) => {
  const location = useLocation();
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-200 flex-shrink-0">
            <img src={logo} alt="SR" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Smart Restaurant</span>
        </div>
        <nav className="p-4 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} onClick={onClose}
              className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

const DashboardLayout = ({ links, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar links={links} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiMenu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
              <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize hidden sm:block">({user?.role})</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Logout">
              <FiLogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
