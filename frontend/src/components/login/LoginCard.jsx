import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/Auth";
import { AdminAuthContext } from "../../context/AdminAuth";
import { url } from "../../baseUrl";
import googleicon from "./google.png";

export const LoginCard = () => {
  const context = useContext(AuthContext);
  const adminContext = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPasword] = useState("");

  const login = async () => {
    try {
      const response = await axios.post(`${url}/auth/login`, {
        text: username,
        password,
      });

      // Check if admin login
      if (response.data.isAdmin) {
        const result = await adminContext.loginAdmin({
          text: username,
          password,
        });
        if (result.success) {
          navigate("/admin/dashboard");
          return;
        }
      }

      // Regular user login
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      context.setAuth(response.data.user);
      window.location.reload();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      context.throwErr(errorMessage);
      console.log(errorMessage);
    }
  };

  function handleGoogleAuth() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: process.env.REACT_APP_GOOGLE_OAUTH_REDIRECT_URL,
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    window.location.assign(`${rootUrl}?${qs.toString()}`);
  }

  return (
    <div className="w-full max-w-md px-4 md:px-0">
      {/* Modern Glass Card */}
      <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl shadow-blue-500/10">
        {/* Gradient Orb Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>

        {/* Logo Branding */}
        <div className="relative text-center mb-10">
          <div className="flex justify-center mb-4">
            <img
              src="/logoround.png"
              alt="Connectify Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Welcome back! Please login to continue
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-5 relative">
          <div className="group">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 group-hover:border-slate-600"
              type="text"
              placeholder="Username or email"
            />
          </div>

          <div className="group">
            <input
              value={password}
              onChange={(e) => setPasword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 group-hover:border-slate-600"
              type="password"
              placeholder="Password"
            />
          </div>

          {/* Login Button */}
          {username !== "" && password !== "" ? (
            <button
              onClick={() => login()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          ) : (
            <button
              disabled
              className="w-full py-4 bg-slate-800/50 text-slate-600 font-bold rounded-xl cursor-not-allowed"
            >
              Sign In
            </button>
          )}

          {/* Forgot Password */}
          <div className="text-center">
            <Link
              to="/forgot"
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>

          {/* Divider */}

        </div>
      </div>

      {/* Sign Up Prompt */}
      <div className="mt-6 text-center bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-5">
        <p className="text-slate-400 text-sm">
          Don't have an account?
          <Link
            to="/signup"
            className="ml-2 text-blue-400 hover:text-blue-300 font-bold transition-colors duration-200"
          >
            Sign up
          </Link>
        </p>
        <Link
          to="/admin/login"
          className="block mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors duration-200"
        >
          Admin Portal →
        </Link>
      </div>
    </div>
  );
};
