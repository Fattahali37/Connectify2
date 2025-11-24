import React, { useContext } from "react";
import { AuthContext } from "../context/Auth";
import defaultimg from "../assets/dafault.png";
import { useState } from "react";
import { api } from "../Interceptor/apiCall";
import { url } from "../baseUrl";
import Resizer from "react-image-file-resizer";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase";
import { Link, useParams } from "react-router-dom";

export const Settings = () => {
  const context = useContext(AuthContext);
  const params = useParams();
  const [username, setUsername] = useState(context.auth.username);
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(context.auth.bio);
  const [website, setWebsite] = useState(context.auth.website);
  const [name, setName] = useState(context.auth.name);
  const [avatar, setAvatar] = useState(context.auth.avatar);

  const [resetPasword, setResetPassword] = useState("");
  const [resetNewPasword, setResetNewPassword] = useState("");
  const [resetConfirmPasword, setResetConfirmPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(context.auth.private || false);

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        "JPEG",
        20,
        0,
        (uri) => {
          resolve(uri);
        },
        "file"
      );
    });

  function edit() {
    let data;
    if (!email) {
      data = {
        username,
        name,
        bio,
        website,
        avatar,
        private: isPrivate,
      };
    } else {
      data = {
        email,
        username,
        name,
        bio,
        website,
        avatar,
        private: isPrivate,
      };
    }
    api
      .put(`${url}/user`, data)
      .then((res) => {
        if (res.data?.success) {
          context.throwSuccess("updated");
          const updatedUser = res.data.user || { ...context.auth, ...data };
          // update context state properly so UI re-renders
          context.setAuth(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else if (res.data) {
          // fallback: server returned non-standard payload
          context.throwSuccess("updated");
          const updatedUser = { ...context.auth, ...data };
          context.setAuth(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message || err.message || "Update failed";
        context.throwErr(errorMessage);
      });
    console.log(data);
  }

  async function handleChangeAvatar(e) {
    const file = e.target.files[0];
    console.log(file);
    if (
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png"
    ) {
      const newFile = await resizeFile(file);
      const storageRef = ref(storage, "images/" + newFile.name);
      const uploadTask = uploadBytesResumable(storageRef, newFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.log(error);
          context.throwErr("Some error occured");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            setAvatar(downloadURL);
          });
        }
      );
      console.log(newFile);
    } else {
      context.throwErr("File type not supported");
    }
  }

  async function handlePasswordChange() {
    api
      .put(`${url}/user/changepassword`, {
        password: resetPasword,
        newPassword: resetNewPasword,
        confirmPassword: resetConfirmPasword,
      })
      .then((res) => {
        if (res.data?.success) {
          context.throwSuccess("Updated password");
          setResetConfirmPassword("");
          setResetNewPassword("");
          setResetPassword("");
        }
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Password update failed";
        context.throwErr(errorMessage);
      });
  }

  return (
    <>
      <div
        className="settings-container"
        style={{
          width: "calc(100% - var(--sidebar-width, 280px))",
          marginLeft: "var(--sidebar-width, 280px)",
          padding: window.innerWidth < 768 ? "20px" : "40px",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, rgb(2, 6, 23) 0%, rgb(15, 23, 42) 50%, rgb(2, 6, 23) 100%)",
          position: "relative",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Main Content Card */}
        <div
          style={{
            maxWidth: window.innerWidth < 768 ? "100%" : "1000px",
            margin: "0 auto",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: window.innerWidth < 768 ? "20px 16px" : "32px",
              borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
              background:
                "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)",
            }}
          >
            <h1
              style={{
                fontSize: window.innerWidth < 768 ? "22px" : "28px",
                fontWeight: "700",
                background:
                  "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Settings
            </h1>
            <p
              style={{
                fontSize: window.innerWidth < 768 ? "12px" : "14px",
                color: "rgba(148, 163, 184, 0.9)",
                marginTop: "8px",
                marginBottom: 0,
              }}
            >
              Manage your account settings and preferences
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: window.innerWidth < 768 ? "column" : "row" }}>
            {/* Sidebar Navigation */}
            <div
              style={{
                width: window.innerWidth < 768 ? "100%" : "260px",
                padding: window.innerWidth < 768 ? "16px" : "24px",
                borderRight: window.innerWidth < 768 ? "none" : "1px solid rgba(148, 163, 184, 0.15)",
                borderBottom: window.innerWidth < 768 ? "1px solid rgba(148, 163, 184, 0.15)" : "none",
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.5) 100%)",
                display: window.innerWidth < 768 ? "flex" : "flex",
                flexDirection: window.innerWidth < 768 ? "row" : "column",
                gap: window.innerWidth < 768 ? "12px" : "0px",
              }}
            >
              <Link
                to="/accounts/edit"
                style={params.params === "edit" ? activeStyle : inactiveStyle}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "12px" }}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Edit Profile
              </Link>
              <Link
                to="/accounts/reset"
                style={params.params !== "edit" ? activeStyle : inactiveStyle}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "12px" }}
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Change Password
              </Link>
            </div>
            {/* Content Area */}
            {params?.params === "edit" ? (
              <div style={{ flex: 1, padding: window.innerWidth < 768 ? "16px" : "32px" }}>
                {/* Avatar Section */}
                <div
                  style={{
                    display: "flex",
                    alignItems: window.innerWidth < 768 ? "flex-start" : "center",
                    gap: window.innerWidth < 768 ? "16px" : "24px",
                    flexDirection: window.innerWidth < 768 ? "column" : "row",
                    padding: window.innerWidth < 768 ? "16px" : "24px",
                    background:
                      "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(51, 65, 85, 0.4) 100%)",
                    borderRadius: "16px",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                    marginBottom: window.innerWidth < 768 ? "24px" : "32px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={avatar ? avatar : defaultimg}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "3px solid rgba(59, 130, 246, 0.5)",
                        boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                      }}
                      alt="Avatar"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        margin: 0,
                        marginBottom: "8px",
                      }}
                    >
                      {context.auth.username}
                    </h3>
                    <input
                      onChange={(e) => handleChangeAvatar(e)}
                      id="imgchange"
                      type="file"
                      hidden
                    />
                    <label
                      htmlFor="imgchange"
                      style={{
                        color: "rgb(59, 130, 246)",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "inline-block",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "rgb(96, 165, 250)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "rgb(59, 130, 246)")
                      }
                    >
                      Change profile photo
                    </label>
                  </div>
                </div>
                {/* Form Fields */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  {/* Name Field */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "8px",
                      }}
                    >
                      Name
                    </label>
                    <input
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      value={name}
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "rgba(226, 232, 240, 0.95)",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(59, 130, 246, 0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(148, 163, 184, 0.3)")
                      }
                    />
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "rgba(148, 163, 184, 0.7)",
                        lineHeight: "1.5",
                      }}
                    >
                      Help people discover your account by using the name you're
                      known by.
                    </p>
                  </div>

                  {/* Username Field */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "8px",
                      }}
                    >
                      Username
                    </label>
                    <input
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      value={username}
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "rgba(226, 232, 240, 0.95)",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(59, 130, 246, 0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(148, 163, 184, 0.3)")
                      }
                    />
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "rgba(148, 163, 184, 0.7)",
                      }}
                    >
                      Your unique username for your profile.
                    </p>
                  </div>

                  {/* Website Field */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "8px",
                      }}
                    >
                      Website
                    </label>
                    <input
                      onChange={(e) => setWebsite(e.target.value)}
                      type="text"
                      value={website}
                      placeholder="https://example.com"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "rgba(226, 232, 240, 0.95)",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(59, 130, 246, 0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(148, 163, 184, 0.3)")
                      }
                    />
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "rgba(148, 163, 184, 0.7)",
                      }}
                    >
                      Share your website or portfolio link.
                    </p>
                  </div>

                  {/* Bio Field */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "8px",
                      }}
                    >
                      Bio
                    </label>
                    <textarea
                      onChange={(e) => setBio(e.target.value)}
                      value={bio}
                      rows="4"
                      maxLength="150"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "rgba(226, 232, 240, 0.95)",
                        outline: "none",
                        transition: "all 0.2s",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(59, 130, 246, 0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(148, 163, 184, 0.3)")
                      }
                    />
                    <p
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "rgba(148, 163, 184, 0.7)",
                      }}
                    >
                      {bio?.length || 0} / 150 characters
                    </p>
                  </div>

                  {/* Privacy Settings Divider */}
                  <div
                    style={{
                      padding: "24px 0",
                      borderTop: "1px solid rgba(148, 163, 184, 0.15)",
                      marginTop: "16px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        margin: 0,
                        marginBottom: "8px",
                      }}
                    >
                      Privacy Settings
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(148, 163, 184, 0.7)",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      Control who can see your posts and follow you.
                    </p>
                  </div>

                  {/* Private Account Toggle */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px",
                      background:
                        "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(51, 65, 85, 0.4) 100%)",
                      borderRadius: "12px",
                      border: "1px solid rgba(148, 163, 184, 0.15)",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "rgba(226, 232, 240, 0.95)",
                          marginBottom: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "rgba(59, 130, 246, 0.8)" }}
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Private Account
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "rgba(148, 163, 184, 0.8)",
                          margin: 0,
                          lineHeight: "1.5",
                        }}
                      >
                        When your account is private, only people you approve
                        can see your posts, followers, and who you follow.
                      </p>
                    </div>
                    <div
                      onClick={() => setIsPrivate(!isPrivate)}
                      style={{
                        width: "52px",
                        height: "28px",
                        background: isPrivate
                          ? "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)"
                          : "rgba(148, 163, 184, 0.3)",
                        borderRadius: "14px",
                        position: "relative",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: isPrivate
                          ? "0 4px 12px rgba(59, 130, 246, 0.4)"
                          : "none",
                        marginLeft: "20px",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          background: "white",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "3px",
                          left: isPrivate ? "27px" : "3px",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Personal Information Divider */}
                  <div
                    style={{
                      padding: "24px 0",
                      borderTop: "1px solid rgba(148, 163, 184, 0.15)",
                      marginTop: "16px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        margin: 0,
                        marginBottom: "8px",
                      }}
                    >
                      Personal Information
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(148, 163, 184, 0.7)",
                        margin: 0,
                        lineHeight: "1.5",
                      }}
                    >
                      This information won't be part of your public profile.
                    </p>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "8px",
                      }}
                    >
                      Email
                    </label>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      type="email"
                      placeholder="your.email@example.com"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "rgba(226, 232, 240, 0.95)",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(59, 130, 246, 0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(148, 163, 184, 0.3)")
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <div style={{ paddingTop: "16px" }}>
                    {!(username && name) ? (
                      <button
                        disabled
                        style={{
                          padding: "12px 32px",
                          background: "rgba(148, 163, 184, 0.3)",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "rgba(148, 163, 184, 0.6)",
                          cursor: "not-allowed",
                          transition: "all 0.2s",
                        }}
                      >
                        Save Changes
                      </button>
                    ) : (
                      <button
                        onClick={() => edit()}
                        style={{
                          padding: "12px 32px",
                          background:
                            "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "white",
                          cursor: "pointer",
                          boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(59, 130, 246, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 4px 16px rgba(59, 130, 246, 0.4)";
                        }}
                      >
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, padding: window.innerWidth < 768 ? "16px" : "32px" }}>
                {/* User Info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "24px",
                    background:
                      "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(51, 65, 85, 0.4) 100%)",
                    borderRadius: "16px",
                    border: "1px solid rgba(148, 163, 184, 0.15)",
                    marginBottom: "32px",
                  }}
                >
                  <img
                    src={avatar ? avatar : defaultimg}
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "3px solid rgba(59, 130, 246, 0.5)",
                      boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                    }}
                    alt="Avatar"
                  />
                  <div>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        margin: 0,
                      }}
                    >
                      {context.auth.username}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "rgba(148, 163, 184, 0.7)",
                        margin: "4px 0 0 0",
                      }}
                    >
                      Change your account password
                    </p>
                  </div>
                </div>

                {/* Password Fields */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  {/* Old Password */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "8px",
                      }}
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={resetPasword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="Enter your current password"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "rgba(226, 232, 240, 0.95)",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(59, 130, 246, 0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(148, 163, 184, 0.3)")
                      }
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "8px",
                      }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      value={resetNewPasword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "rgba(226, 232, 240, 0.95)",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(59, 130, 246, 0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(148, 163, 184, 0.3)")
                      }
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "rgba(226, 232, 240, 0.95)",
                        marginBottom: "8px",
                      }}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={resetConfirmPasword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(148, 163, 184, 0.3)",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "rgba(226, 232, 240, 0.95)",
                        outline: "none",
                        transition: "all 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "rgba(59, 130, 246, 0.5)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor =
                          "rgba(148, 163, 184, 0.3)")
                      }
                    />
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      paddingTop: "16px",
                    }}
                  >
                    {!(
                      resetPasword &&
                      resetNewPasword &&
                      resetConfirmPasword
                    ) ? (
                      <button
                        disabled
                        style={{
                          padding: "12px 32px",
                          background: "rgba(148, 163, 184, 0.3)",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "rgba(148, 163, 184, 0.6)",
                          cursor: "not-allowed",
                          transition: "all 0.2s",
                        }}
                      >
                        Change Password
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePasswordChange()}
                        style={{
                          padding: "12px 32px",
                          background:
                            "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "white",
                          cursor: "pointer",
                          boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(59, 130, 246, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 4px 16px rgba(59, 130, 246, 0.4)";
                        }}
                      >
                        Change Password
                      </button>
                    )}

                    <Link
                      to="/forgot"
                      style={{
                        fontSize: "14px",
                        color: "rgb(59, 130, 246)",
                        textDecoration: "none",
                        fontWeight: "500",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "rgb(96, 165, 250)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "rgb(59, 130, 246)")
                      }
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const activeStyle = {
  display: "flex",
  alignItems: "center",
  padding: window.innerWidth < 768 ? "12px 16px" : "14px 20px",
  margin: window.innerWidth < 768 ? "0" : "8px 0",
  fontSize: window.innerWidth < 768 ? "13px" : "14px",
  fontWeight: "600",
  color: "rgba(226, 232, 240, 0.95)",
  background:
    "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
  borderLeft: window.innerWidth < 768 ? "none" : "3px solid rgb(59, 130, 246)",
  borderBottom: window.innerWidth < 768 ? "2px solid rgb(59, 130, 246)" : "none",
  borderRadius: window.innerWidth < 768 ? "12px" : "0 12px 12px 0",
  textDecoration: "none",
  transition: "all 0.2s",
  flex: window.innerWidth < 768 ? "1" : "auto",
};

const inactiveStyle = {
  display: "flex",
  alignItems: "center",
  padding: window.innerWidth < 768 ? "12px 16px" : "14px 20px",
  margin: window.innerWidth < 768 ? "0" : "8px 0",
  fontSize: window.innerWidth < 768 ? "13px" : "14px",
  fontWeight: window.innerWidth < 768 ? "600" : "500",
  color: "rgba(148, 163, 184, 0.9)",
  textDecoration: "none",
  borderLeft: window.innerWidth < 768 ? "none" : "3px solid transparent",
  borderBottom: window.innerWidth < 768 ? "2px solid transparent" : "none",
  borderRadius: window.innerWidth < 768 ? "12px" : "0 12px 12px 0",
  transition: "all 0.2s",
  flex: window.innerWidth < 768 ? "1" : "auto",
};
