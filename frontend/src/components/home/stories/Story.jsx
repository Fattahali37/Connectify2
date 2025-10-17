import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { url } from "../../../baseUrl";
import { api } from "../../../Interceptor/apiCall";
import defaultImg from "../../../assets/dafault.png";
// import { useContext } from 'react'
import { Link } from "react-router-dom";
// import { AuthContext } from '../../../context/Auth'

export default function Story({ seen, owner, id }) {
  // const context = useContext(AuthContext)
  const [user, setUser] = useState();
  // border: !seen?.includes(context.auth._id) && '3px solid #DE0046',
  useEffect(() => {
    api
      .get(`${url}/user/get/${owner}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  }, [owner]);
  return (
    <Link
      to={`/story/${user?._id}?id=${id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        minWidth: "80px",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-4px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div
        className="image"
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
          padding: "3px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
            padding: "3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={user?.avatar || defaultImg}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
            alt=""
          />
        </div>
      </div>
      <p
        style={{
          fontSize: "12px",
          textAlign: "center",
          color: "rgba(226, 232, 240, 0.9)",
          fontWeight: "500",
          maxWidth: "80px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {user &&
          (user.username.length > 8
            ? user.username.slice(0, 8) + "..."
            : user.username)}
      </p>
    </Link>
  );
}
