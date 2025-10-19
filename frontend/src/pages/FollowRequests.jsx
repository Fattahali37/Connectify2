import React, { useEffect, useState } from "react";
import { api } from "../Interceptor/apiCall";
import { url } from "../baseUrl";
import { Spinner } from "../assets/Spinner";

export const FollowRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    api
      .get(`${url}/user/follow-requests`)
      .then((res) => {
        console.log("📥 Follow Requests Response:", res.data);
        console.log("📥 Number of requests:", res.data?.requests?.length || 0);
        if (res.data?.success) {
          setRequests(res.data.requests || []);
        }
      })
      .catch((err) => console.error("❌ Error fetching requests:", err))
      .finally(() => setLoading(false));
  };

  const handleAccept = (userId) => {
    api
      .post(`${url}/user/follow-requests/accept/${userId}`)
      .then((res) => {
        if (res.data?.success) {
          setRequests((prev) => prev.filter((req) => req.user._id !== userId));
          // Refresh the count for parent components
          window.dispatchEvent(new Event("requestCountUpdated"));
        }
      })
      .catch((err) => console.error(err));
  };

  const handleReject = (userId) => {
    api
      .post(`${url}/user/follow-requests/reject/${userId}`)
      .then((res) => {
        if (res.data?.success) {
          setRequests((prev) => prev.filter((req) => req.user._id !== userId));
          // Refresh the count for parent components
          window.dispatchEvent(new Event("requestCountUpdated"));
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgb(2, 6, 23) 0%, rgb(15, 23, 42) 50%, rgb(2, 6, 23) 100%)",
        padding: "40px 20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.16)",
          height: "fit-content",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "rgba(226, 232, 240, 0.95)",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Follow Requests
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(148, 163, 184, 0.8)",
            marginBottom: "32px",
          }}
        >
          {requests.length} pending request{requests.length !== 1 ? "s" : ""}
        </p>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px 0",
            }}
          >
            <Spinner />
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(148, 163, 184, 0.8)",
            }}
          >
            <svg
              aria-label="No requests"
              height="96"
              role="img"
              viewBox="0 0 96 96"
              width="96"
              style={{ opacity: 0.3, margin: "0 auto 20px" }}
            >
              <circle
                cx="48"
                cy="48"
                fill="none"
                r="47"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></circle>
              <ellipse
                cx="48"
                cy="44"
                fill="none"
                rx="20"
                ry="20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></ellipse>
              <path
                d="M24 66.5c0-10.5 10.5-19 24-19s24 8.5 24 19"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <p style={{ fontSize: "16px", fontWeight: "600" }}>
              No Follow Requests
            </p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
              When people request to follow you, they'll appear here.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {requests.map((request) => (
              <div
                key={request.user._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  background:
                    "linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  <img
                    src={
                      request.user.avatar || "https://via.placeholder.com/48"
                    }
                    alt={request.user.username}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(59, 130, 246, 0.3)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "4px",
                      }}
                    >
                      {request.user.username}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(148, 163, 184, 0.8)",
                      }}
                    >
                      {request.user.name}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleAccept(request.user._id)}
                    style={{
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: "600",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 2px 8px rgba(59, 130, 246, 0.3)";
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.user._id)}
                    style={{
                      padding: "8px 20px",
                      fontSize: "14px",
                      fontWeight: "600",
                      borderRadius: "8px",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      background: "rgba(15, 23, 42, 0.5)",
                      color: "rgba(226, 232, 240, 0.95)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "rgba(30, 41, 59, 0.7)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "rgba(15, 23, 42, 0.5)";
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
