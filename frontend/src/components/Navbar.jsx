import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isReady } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!isReady) return null;

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <img
          src={logo}
          alt="App logo"
          className="h-8 w-auto"
        />
        <span className="text-lg font-semibold">CodePlatform</span>
      </Link> 

      <div className="flex items-center gap-6 text-sm">
        {!user && (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}

        {user && (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>

            <Link to="/profile" className="hover:underline">
              Profile
            </Link>

            {user.role === "admin" && (
              <Link to="/admin/curriculum" className="hover:underline">
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
