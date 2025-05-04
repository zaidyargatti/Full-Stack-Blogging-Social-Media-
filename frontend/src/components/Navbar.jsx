// components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FiBell, FiLogOut, FiSearch } from 'react-icons/fi';

function Navbar() {
  const { user, logout } = useAuth();
  const { hasUnread } = useNotification(); // ✅ red dot
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className=" px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-black-600">
        Blog
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/search-users" className="flex items-center gap-1 text-gray-700 hover:text-[#050B1E]">
          <FiSearch />
          <span className="hidden sm:inline">Search User</span>
        </Link>

        <Link to="/notifications" className="relative text-gray-700 hover:text-[#050B1E]">
          <FiBell className="text-xl" />
          {hasUnread && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full" />
          )}
        </Link>

        <Link to="/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-[#050B1E]">
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-black"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-gray-700 hover:text-red-600"
        >
          <FiLogOut />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
