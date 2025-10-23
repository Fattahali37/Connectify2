import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        width: "98%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "auto",
        padding: "12px 0",
      }}
    >
      <Link to="/">
        <img
          src="/logoround.png"
          style={{ width: "110px" }}
          alt="Connectify Logo"
        />
      </Link>
      <CloseIcon
        onClick={() => navigate("/")}
        sx={{ color: "white", fontSize: "25px", cursor: "pointer" }}
      />
    </div>
  );
}
