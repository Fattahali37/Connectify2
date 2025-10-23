import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../../Interceptor/apiCall";
import { url } from "../../baseUrl";
import { User } from "../dialog/User";
import { Spinner } from "../../assets/Spinner";
import CloseIcon from "@mui/icons-material/Close";

export default function Search() {
  const [text, setText] = useState("");
  const [show, setShow] = useState(false);
  const [userResults, setuserResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const time = setTimeout(() => {
      if (!text) {
        setLoading(false);
        return;
      }
      api.get(`${url}/user/search/${text}`).then((res) => {
        if (res.data) {
          console.log(res.data);
          setuserResults(res.data);
        }
        setLoading(false);
      });
    }, 1200);
    return () => {
      clearInterval(time);
      setuserResults([]);
      setLoading(true);
    };
  }, [text]);

  return (
    <>
      <div className="search" style={{ position: "relative" }}>
        <SearchIcon
          sx={{
            fontSize: "17px",
            marginRight: "8px",
            color: "rgba(148, 163, 184, 0.9)",
          }}
        />
        <input
          onClick={() => setShow(true)}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", fontSize: "14px" }}
          type="text"
          className="noborder"
          placeholder="Search"
        />
        {show && (
          <CloseIcon
            onClick={() => setShow(false)}
            sx={{
              fontSize: "17px",
              marginRight: "8px",
              color: "rgba(148, 163, 184, 0.9)",
              cursor: "pointer",
              "&:hover": { color: "rgba(239, 68, 68, 0.9)" },
            }}
          />
        )}

        {/* Dropdown positioned directly below the search input */}
        {show && (
          <div
            className="containerSuggest"
            style={{
              position: "absolute",
              left: 0,
              top: "calc(100% + 8px)",
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
              backdropFilter: "blur(16px)",
              width: "100%",
              maxWidth: "372px",
              boxSizing: "border-box",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "12px",
              minHeight: "75px",
              maxHeight: "300px",
              overflowY: "auto",
              padding: "15px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              zIndex: 1300,
            }}
          >
            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                <Spinner />
              </div>
            )}
            {userResults.length === 0 && !loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px 20px",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "8px",
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.6)"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "15px",
                    textAlign: "center",
                    color: "rgba(226, 232, 240, 0.95)",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  No results found
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    textAlign: "center",
                    color: "rgba(148, 163, 184, 0.9)",
                    maxWidth: "280px",
                  }}
                >
                  {text
                    ? "Try searching with a different keyword"
                    : "Start typing to search for users"}
                </p>
              </div>
            ) : (
              <>
                {Array.isArray(userResults) &&
                  userResults.map((item) => (
                    <User setShow={setShow} key={item._id} user={item} />
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
