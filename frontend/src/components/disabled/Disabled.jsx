import React from "react";

export const Disabled = ({ text }) => {
  return (
    <button
      disabled
      className="w-3/4 py-2 px-2 mt-5 rounded-md text-dark-text-tertiary bg-dark-border text-sm font-bold cursor-not-allowed opacity-60"
    >
      {text}
    </button>
  );
};
