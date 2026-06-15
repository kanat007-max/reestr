import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import useState from 'react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transition-transform duration-300 md:translate-x-0 md:static`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold">Reestr</h1>
          <p className="text-sm text-blue-200 mt-1">Import Management</p>
        </div>

        <nav className="mt-8">
          <Link
            to="/"
            className="block px-6 py-3 hover:bg-blue-800 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/requests/new"
            className="block px-6 py-3 hover:bg-blue-800 transition"
          >
            New Request
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/users"
              className="block px-6 py-3 hover:bg-blue-800 transition"
            >
              User Management
            </Link>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="flex justify-between items-center px-6 py-4">
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
