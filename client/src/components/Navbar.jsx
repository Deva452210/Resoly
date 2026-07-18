import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wider">
          RESOLY
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {user.role === "citizen" && (
                <>
                  <Link
                    to="/feed"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Feed
                  </Link>
                  <Link
                    to="/report-issue"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Report Issue
                  </Link>
                </>
              )}
              {user.role === "officer" && (
                <Link
                  to="/officer-dashboard"
                  className="hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {user.role === "authority" && (
                <>
                  <Link
                    to="/authority-dashboard"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/authority-analytics"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Analytics
                  </Link>
                  <Link
                    to="/command-center"
                    className="hover:text-purple-400 transition-colors text-purple-300 font-bold flex items-center gap-1"
                  >
                    <span>🧠</span> Command Center
                  </Link>
                </>
              )}
              <span className="text-gray-400 text-sm ml-4">
                Hello, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-1 rounded hover:bg-red-500 transition-colors ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-gray-400 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white px-4 py-1 rounded hover:bg-gray-200 transition-colors text-black"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
