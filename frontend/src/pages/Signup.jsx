import React from "react";
import phone from "../assets/gifphone.gif";
import { SignupCard } from "../components/login/SignupCard";

export function Signup() {
  return (
    <div className="min-h-screen bg-dark-primary flex flex-col lg:flex-row justify-around items-center px-4 py-8 lg:py-0 relative">
      <div className="login-left hidden lg:block">
        <div className="phone relative">
          <img
            className="w-full max-w-[453px]"
            src={phone}
            alt="Phone mockup"
          />
        </div>
      </div>
      <SignupCard />

      <span className="absolute bottom-4 text-sm text-dark-text-tertiary">
        © 2024 Connectify
      </span>
    </div>
  );
}
