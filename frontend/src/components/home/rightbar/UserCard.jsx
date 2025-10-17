import React, { useState } from "react";
import { Link } from "react-router-dom";
import { url } from "../../../baseUrl";
import { api } from "../../../Interceptor/apiCall";
import deafultImg from "../../../assets/dafault.png";

export function UserCard({ avatar, username, name, userId }) {
  const [iFollow, setIFollow] = useState(false);
  async function handleFollow() {
    api.get(`${url}/user/handlefollow/${userId}`).then((res) => {
      if (res.data) {
        setIFollow((prev) => !prev);
      }
    });
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "8px",
        borderRadius: "12px",
        transition: "all 0.3s ease",
        background: "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        className="left"
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <div className="user-img" style={{ marginRight: "14px" }}>
          <Link to={`/${username}`}>
            <img
              src={avatar ?? deafultImg}
              style={{
                width: "42px",
                borderRadius: "50%",
                height: "42px",
                objectFit: "cover",
                border: "2px solid rgba(59, 130, 246, 0.2)",
                transition: "all 0.3s ease",
              }}
              alt=""
              onMouseEnter={(e) => {
                e.target.style.borderColor = "rgba(59, 130, 246, 0.5)";
                e.target.style.boxShadow = "0 0 8px rgba(59, 130, 246, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(59, 130, 246, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </Link>
        </div>
        <div
          className="username"
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "-4px",
          }}
        >
          <Link
            to={`/${username}`}
            style={{
              fontSize: "13.5px",
              marginLeft: "4px",
              marginTop: "0px",
              fontWeight: "600",
              textDecoration: "none",
              color: "rgba(226, 232, 240, 0.95)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background =
                "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
              e.target.style.webkitBackgroundClip = "text";
              e.target.style.webkitTextFillColor = "transparent";
              e.target.style.backgroundClip = "text";
            }}
            onMouseLeave={(e) => {
              e.target.style.webkitTextFillColor = "rgba(226, 232, 240, 0.95)";
            }}
          >
            {username && username}
          </Link>
          <Link
            to={`/${username}`}
            style={{
              fontSize: "12px",
              marginLeft: "4px",
              color: "rgba(148, 163, 184, 0.7)",
              marginTop: "3.7px",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.color = "rgba(148, 163, 184, 0.9)")
            }
            onMouseLeave={(e) =>
              (e.target.style.color = "rgba(148, 163, 184, 0.7)")
            }
          >
            {name}
          </Link>
        </div>
      </div>
      <div className="follow-btn">
        <button
          onClick={() => handleFollow()}
          className="no-style"
          style={{
            padding: "6px 16px",
            borderRadius: "8px",
            background: !iFollow
              ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
              : "rgba(220, 38, 38, 0.1)",
            border: !iFollow ? "none" : "1px solid rgba(220, 38, 38, 0.3)",
            transition: "all 0.3s ease",
            boxShadow: !iFollow ? "0 2px 8px rgba(59, 130, 246, 0.3)" : "none",
          }}
          onMouseEnter={(e) => {
            if (!iFollow) {
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(59, 130, 246, 0.4)";
              e.currentTarget.style.transform = "translateY(-1px)";
            } else {
              e.currentTarget.style.background = "rgba(220, 38, 38, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            if (!iFollow) {
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(59, 130, 246, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            } else {
              e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)";
            }
          }}
        >
          <p
            style={{
              color: !iFollow ? "#ffffff" : "rgb(239, 68, 68)",
              fontSize: "13px",
              fontWeight: "600",
              margin: 0,
            }}
          >
            {iFollow ? "Unfollow" : "Follow"}
          </p>
        </button>
      </div>
    </div>
  );
}
