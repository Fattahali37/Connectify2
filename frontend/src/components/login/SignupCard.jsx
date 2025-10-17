import axios from "axios";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
// using public logo
import { url } from "../../baseUrl";
import { AuthContext } from "../../context/Auth";
import { Disabled } from "../disabled/Disabled";

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

  return (
    <div className="right-login px-4 md:px-0">
      <div className="signup-box border border-dark-border">
        <img
          className="w-3/5 my-8 mb-6"
          src="/logoround.png"
          alt="Connectify Logo"
        />
        <p className="mt-0 text-dark-text-secondary text-base mb-6 w-4/5 text-center font-semibold">
          Sign up to see photos and videos from your friends
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-3/4 h-9 text-sm px-2 mt-4 rounded-md bg-dark-secondary border border-dark-border text-dark-text-primary placeholder-dark-text-tertiary focus:border-brand-blue focus:outline-none transition-colors"
          type="text"
          placeholder="Email address"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-3/4 h-9 text-sm px-2 mt-4 rounded-md bg-dark-secondary border border-dark-border text-dark-text-primary placeholder-dark-text-tertiary focus:border-brand-blue focus:outline-none transition-colors"
          type="text"
          placeholder="Full Name"
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-3/4 h-9 text-sm px-2 mt-4 rounded-md bg-dark-secondary border border-dark-border text-dark-text-primary placeholder-dark-text-tertiary focus:border-brand-blue focus:outline-none transition-colors"
          type="text"
          placeholder="Username"
        />
        <input
          value={password}
          onChange={(e) => setPasword(e.target.value)}
          className="w-3/4 h-9 text-sm px-2 mt-4 rounded-md bg-dark-secondary border border-dark-border text-dark-text-primary placeholder-dark-text-tertiary focus:border-brand-blue focus:outline-none transition-colors"
          type="password"
          placeholder="Password"
        />
        <p className="text-dark-text-tertiary text-xs text-center w-4/5 mt-7">
          People who use our service may have uploaded your contact information
          to Connectify.
        </p>
        <p className="text-dark-text-tertiary text-xs text-center w-4/5 mt-4">
          By signing up, you agree to our Terms, Privacy Policy and Cookies
          Policy.
        </p>
        {username && password && name && email ? (
          <button
            onClick={() => signup()}
            className="w-3/4 py-2 px-2 mt-5 rounded-md text-white bg-brand-blue hover:bg-brand-blue-hover text-sm font-bold transition-colors"
          >
            Sign Up
          </button>
        ) : (
          <Disabled text="Sign Up" />
        )}
      </div>
      <div className="signup-action-box border border-dark-border text-center">
        <p className="text-dark-text-secondary text-sm">
          Have an account?
          <Link
            to="/login"
            className="text-brand-blue font-bold ml-2 hover:text-brand-blue-hover transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
