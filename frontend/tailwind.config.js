/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark theme colors - Updated to gradient slate theme
        "dark-primary": "rgba(15, 23, 42, 0.95)",
        "dark-secondary": "rgba(30, 41, 59, 0.95)",
        "dark-tertiary": "rgba(51, 65, 85, 0.95)",
        "dark-border": "rgba(148, 163, 184, 0.2)",
        "dark-text-primary": "rgba(226, 232, 240, 0.95)",
        "dark-text-secondary": "rgba(148, 163, 184, 0.9)",
        "dark-text-tertiary": "rgba(100, 116, 139, 0.9)",
        // Brand colors
        "brand-blue": "#2196f3",
        "brand-blue-hover": "#1976d2",
        // Slate colors for gradient theme
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "-apple-system", "sans-serif"],
      },
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        dark: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        "dark-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        "gradient-blue": "0 10px 30px -5px rgba(59, 130, 246, 0.3)",
        "gradient-purple": "0 10px 30px -5px rgba(139, 92, 246, 0.3)",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)",
        "gradient-primary-hover":
          "linear-gradient(135deg, rgb(37, 99, 235) 0%, rgb(109, 40, 217) 100%)",
        "gradient-slate":
          "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
        "gradient-slate-light":
          "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
        "gradient-success":
          "linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(21, 128, 61) 100%)",
        "gradient-danger":
          "linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(220, 38, 38) 100%)",
        "gradient-warning":
          "linear-gradient(135deg, rgb(234, 179, 8) 0%, rgb(202, 138, 4) 100%)",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
    },
  },
  plugins: [],
};
