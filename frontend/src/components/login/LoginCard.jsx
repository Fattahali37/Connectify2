import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// using public logo
import { Disabled } from "../disabled/Disabled";
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
    <div className="right-login px-4 md:px-0">
      <div className="login-box border border-dark-border pb-4">
        <img
          className="w-3/5 my-8 mb-6"
          src="/logoround.png"
          alt="Connectify Logo"
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-3/4 h-9 text-sm px-2 mt-2 rounded-md bg-dark-secondary border border-dark-border text-dark-text-primary placeholder-dark-text-tertiary focus:border-brand-blue focus:outline-none transition-colors"
          type="text"
          placeholder="Username or email address"
        />
        <input
          value={password}
          onChange={(e) => setPasword(e.target.value)}
          className="w-3/4 h-9 text-sm px-2 mt-4 rounded-md bg-dark-secondary border border-dark-border text-dark-text-primary placeholder-dark-text-tertiary focus:border-brand-blue focus:outline-none transition-colors"
          type="password"
          placeholder="Password"
        />
        {username !== "" && password !== "" ? (
          <button
            onClick={() => login()}
            className="w-3/4 py-2 px-2 mt-5 rounded-md text-white bg-brand-blue hover:bg-brand-blue-hover text-sm font-bold transition-colors"
          >
            Login
          </button>
        ) : (
          <Disabled text={"Log in"}></Disabled>
        )}
        <div className="flex flex-row items-center mt-9">
          <div className="h-px w-28 bg-dark-border"></div>
          <span className="mx-2 text-dark-text-tertiary text-xs font-bold">
            OR
          </span>
          <div className="h-px w-28 bg-dark-border"></div>
        </div>
        <Link
          to="/forgot"
          className="mt-6 text-dark-text-secondary text-sm hover:text-dark-text-primary transition-colors"
        >
          Forgotten your password?
        </Link>
        <button
          onClick={() => handleGoogleAuth()}
          className="flex flex-row items-center justify-center py-2 px-3 mt-5 rounded-md bg-dark-secondary text-dark-text-primary border border-dark-border hover:bg-dark-tertiary transition-colors"
        >
          <img src={googleicon} className="w-5" alt="Google" />
          <p className="ml-2 text-sm">Continue with Google</p>
        </button>
      </div>
      <div className="signup-action-box border border-dark-border text-center flex flex-col">
        <p className="text-dark-text-secondary text-sm">
          Don't have an account?
          <Link
            to="/signup"
            className="text-brand-blue font-bold ml-2 hover:text-brand-blue-hover transition-colors"
          >
            Sign up
          </Link>
        </p>
        <Link
          to="/admin/login"
          className="text-dark-text-tertiary text-xs mt-2 hover:text-dark-text-secondary transition-colors"
        >
          Admin Login
        </Link>
      </div>
    </div>
  );
};
