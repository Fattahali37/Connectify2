import React, { useContext } from "react";
import { AdminAuthContext } from "../../context/AdminAuth";
import { useNavigate } from "react-router-dom";
import {
  Logout as LogoutIcon,
  Language,
  Notifications,
  AccountCircle,
} from "@mui/icons-material";

export default function AdminNavbar() {
  const { logoutAdmin } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 backdrop-blur-xl">
      <div className="max-w-full mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Logo & Title */}
          <div className="flex items-center space-x-4">
            <img
              src="/logoround.png"
              alt="Connectify Logo"
              style={{
                height: "48px",
                width: "auto",
                filter: "drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))",
                transition: "transform 0.3s ease, filter 0.3s ease",
                cursor: "pointer",
              }}
              onClick={() => navigate("/admin/dashboard")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.08)";
                e.currentTarget.style.filter =
                  "drop-shadow(0 6px 16px rgba(59, 130, 246, 0.5))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.filter =
                  "drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))";
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Connectify Admin
              </h1>
              <p className="text-xs text-slate-400">Dashboard Management</p>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 border border-slate-700/50"
            >
              <Language sx={{ fontSize: 18 }} />
              <span className="text-sm font-medium">View Site</span>
            </button>

            <button className="relative p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all duration-200 border border-slate-700/50">
              <Notifications
                className="text-slate-300 hover:text-white"
                sx={{ fontSize: 20 }}
              />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <button className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all duration-200 border border-slate-700/50">
              <AccountCircle
                className="text-slate-300 hover:text-white"
                sx={{ fontSize: 20 }}
              />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
              <span className="text-sm font-medium hidden md:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
