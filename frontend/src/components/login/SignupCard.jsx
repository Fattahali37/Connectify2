import axios from "axios";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { url } from "../../baseUrl";
import { AuthContext } from "../../context/Auth";

export const SignupCard = () => {
  const context = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPasword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const signup = async () => {
    try {
      const response = await axios.post(`${url}/auth/register`, {
        email,
        password,
        username,
        name,
      });
      context.setAuth(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Signup failed";
      context.throwErr(errorMessage);
    }
  };

  const isFormValid = username && password && name && email;

  return (
    <div className="w-full max-w-md px-4 md:px-0">
      <div className="relative bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl shadow-purple-500/10">
        {/* Gradient Orb Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>

        {/* Logo Branding */}
        <div className="relative text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logoround.png"
              alt="Connectify Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Join to share moments with friends
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-4 relative">
          <div className="group">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-slate-600"
              type="email"
              placeholder="Email address"
            />
          </div>

          <div className="group">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-slate-600"
              type="text"
              placeholder="Full name"
            />
          </div>

          <div className="group">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-slate-600"
              type="text"
              placeholder="Username"
            />
          </div>

          <div className="group">
            <input
              value={password}
              onChange={(e) => setPasword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-slate-600"
              type="password"
              placeholder="Password"
            />
          </div>

          {/* Terms Text */}
          <p className="text-xs text-slate-500 text-center leading-relaxed pt-2">
            By signing up, you agree to our{" "}
            <span className="text-slate-400 hover:text-blue-400 cursor-pointer transition-colors">
              Terms
            </span>
            {", "}
            <span className="text-slate-400 hover:text-blue-400 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            {" and "}
            <span className="text-slate-400 hover:text-blue-400 cursor-pointer transition-colors">
              Cookies Policy
            </span>
          </p>

          {/* Signup Button */}
          {isFormValid ? (
            <button
              onClick={() => signup()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Create Account
            </button>
          ) : (
            <button
              disabled
              className="w-full py-4 bg-slate-800/50 text-slate-600 font-bold rounded-xl cursor-not-allowed"
            >
              Create Account
            </button>
          )}
        </div>
      </div>

      {/* Login Prompt */}
      <div className="mt-6 text-center bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-5">
        <p className="text-slate-400 text-sm">
          Already have an account?
          <Link
            to="/login"
            className="ml-2 text-purple-400 hover:text-purple-300 font-bold transition-colors duration-200"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
