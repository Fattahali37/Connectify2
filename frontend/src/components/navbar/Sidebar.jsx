import React, { useState, useContext, useEffect } from "react";
import "./sidebar.css";
import Search from "./Search";
import { Link, NavLink } from "react-router-dom";
import {
  exploreFill,
  homeFill,
  messageFill,
  messageOutline,
  profileIcon,
  savedIcon,
  settingsIcon,
  switchAccountIcon,
  exploreOutline,
  postUploadOutline,
  likeOutline,
  homeOutline,
} from "../../assets/svgIcons";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Badge,
} from "@mui/material";
import { AuthContext } from "../../context/Auth";
import { url } from "../../baseUrl";
import { api } from "../../Interceptor/apiCall";
import defaultImg from "../../assets/dafault.png";
import { NotificationBox } from "../dialog/NotificationBox";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

export const Sidebar = ({ active }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [imgurl, setImgurl] = useState("");
  const context = useContext(AuthContext);
  const [caption, setCaption] = useState("");
  const [innerActive, setInnerActive] = useState();
  const [messageCount, setMessageCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [anchorElNot, setAnchorElNot] = React.useState(null);
  const openNot = Boolean(anchorElNot);
  const handleClickNot = (event) => {
    setInnerActive("notification");
    setAnchorElNot(event.currentTarget);
  };
  const handleCloseNot = () => {
    setAnchorElNot(null);
    setInnerActive();

    // Immediately refresh notification count when closing notification box
    api
      .get(`${url}/user/notifications/unread-count`)
      .then((countRes) => {
        if (countRes?.data && countRes.data.success) {
          setNotificationCount(countRes.data.count);
          console.log(
            "Refreshed notification count after closing:",
            countRes.data.count
          );
        }
      })
      .catch((err) => {
        console.error(
          "Error refreshing notification count:",
          err?.message || err
        );
        // Don't crash - just keep the current count
      });
  };

  const [openDailog, setOpenDilaog] = React.useState(false);

  const handleClickOpen = () => {
    setInnerActive("newpost");
    setOpenDilaog(true);
  };

  const handleCloseDialog = () => {
    setImgurl("");
    setCaption("");
    setOpenDilaog(false);
    setInnerActive();
  };

  // Track unread notification count
  const [notificationCount, setNotificationCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  // Debug: Log badge counts whenever they change
  useEffect(() => {
    console.log(
      "Badge counts - Messages:",
      messageCount,
      "Notifications:",
      notificationCount,
      "Requests:",
      requestCount
    );
    console.log("Auth user:", context.auth?._id);
  }, [messageCount, notificationCount, requestCount, context.auth]);

  useEffect(() => {
    if (!context.auth) return;

    const checkNotifications = async () => {
      try {
        // Get unread notification count
        const countRes = await api.get(
          `${url}/user/notifications/unread-count`
        );
        console.log("Notification count response:", countRes.data);
        if (countRes.data && countRes.data.success) {
          setNotificationCount(countRes.data.count);
          console.log("Setting notification count to:", countRes.data.count);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [context.auth]);

  // Track follow request count
  useEffect(() => {
    if (!context.auth) return;

    const checkFollowRequests = async () => {
      try {
        const response = await api.get(`${url}/user/follow-requests/count`);
        console.log("Follow request count response:", response.data);
        if (response.data && response.data.success) {
          setRequestCount(response.data.count);
          console.log("Setting request count to:", response.data.count);
        }
      } catch (err) {
        console.error("Error fetching follow requests:", err);
      }
    };

    checkFollowRequests();
    const interval = setInterval(checkFollowRequests, 10000); // Check every 10 seconds

    // Listen for custom event when requests are updated
    const handleRequestUpdate = () => {
      checkFollowRequests();
    };
    window.addEventListener("requestCountUpdated", handleRequestUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("requestCountUpdated", handleRequestUpdate);
    };
  }, [context.auth]);

  // Track unread message count
  useEffect(() => {
    if (!context.auth) return;

    const checkUnreadMessages = async () => {
      try {
        const response = await api.get(`${url}/chat/unread-count`);
        console.log("Message count response:", response.data);
        if (response.data && response.data.success) {
          setMessageCount(response.data.count);
          console.log("Setting message count to:", response.data.count);
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    // Initial check
    checkUnreadMessages();

    // Check every 10 seconds for new messages
    const interval = setInterval(checkUnreadMessages, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [context.auth]);

  const logout = async () => {
    try {
      await api.post(`${url}/auth/logout`, {
        token: localStorage.getItem("refresh_token"),
      });
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.clear();
      context.setAuth(null);
      window.location.reload();
    }
  };
  context.logout = logout;

  const upload = async (e) => {
    const file = e.target.files[0];
    if (
      !(
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg"
      )
    ) {
      context.throwErr("File type not supported");
      return;
    }
    const storageRef = ref(storage, "images/" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error);
        context.throwErr("Some error occurred");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImgurl(downloadURL);
        });
      }
    );
  };

  const handlePost = async () => {
    if (!caption) {
      return context.throwErr("Caption Required");
    }
    const data = {
      caption: caption,
      files: [
        {
          fileType: "image",
          link: imgurl,
        },
      ],
    };
    api.post(`${url}/post/create`, data).then((res) => {
      if (res.data) {
        context.throwSuccess("Posted");
        handleCloseDialog();
        // Only call newpost if the function exists (when on Home page)
        if (typeof context.newpost === "function") {
          context.newpost(res.data);
        }
      }
    });
  };

  return (
    <>
      <div className="sidebar-container">
        <div className="sidebar-content">
          <div className="logo-section">
            <Link to="/">
              <img
                src="/logoround.png"
                alt="Connectify Logo"
                className="sidebar-logo"
              />
            </Link>
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/"
              className={`sidebar-item ${
                active === "home" && !innerActive ? "active" : ""
              }`}
            >
              {active === "home" && !innerActive ? homeFill : homeOutline}
              <span>Home</span>
            </NavLink>

            <button
              className="sidebar-item sidebar-button"
              onClick={() => setShowSearch(!showSearch)}
            >
              <SearchIcon sx={{ fontSize: 28 }} />
              <span>Search</span>
            </button>

            <NavLink
              to="/explore"
              className={`sidebar-item ${
                active === "explore" && !innerActive ? "active" : ""
              }`}
            >
              {active === "explore" && !innerActive
                ? exploreFill
                : exploreOutline}
              <span>Explore</span>
            </NavLink>

            <NavLink
              to="/chats/all"
              className={`sidebar-item ${
                active === "chat" && !innerActive ? "active" : ""
              }`}
            >
              <Badge
                badgeContent={messageCount}
                color="error"
                max={99}
                showZero={false}
              >
                {active === "chat" && !innerActive
                  ? messageFill
                  : messageOutline}
              </Badge>
              <span>Messages</span>
            </NavLink>

            <button
              className={`sidebar-item sidebar-button ${
                innerActive === "notification" ? "active" : ""
              }`}
              onClick={(event) => {
                handleClickNot(event);
                // Set count to 0 immediately since NotificationBox will mark all as read
                setTimeout(() => {
                  setNotificationCount(0);
                }, 500);
              }}
            >
              <Badge
                badgeContent={notificationCount}
                color="error"
                max={99}
                showZero={false}
              >
                {innerActive === "notification" ? (
                  <svg
                    aria-label="Notifications"
                    className="sidebar-icon"
                    color="#ffffff"
                    fill="#ffffff"
                    height="24"
                    role="img"
                    viewBox="0 0 48 48"
                    width="24"
                  >
                    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                  </svg>
                ) : (
                  likeOutline
                )}
              </Badge>
              <span>Notifications</span>
            </button>

            {/* Follow Requests Link - Only show if user has private account */}
            {context?.auth?.private && (
              <NavLink
                to="/followrequests"
                className={`sidebar-item ${
                  active === "requests" && !innerActive ? "active" : ""
                }`}
              >
                <Badge
                  badgeContent={requestCount}
                  color="error"
                  max={99}
                  showZero={false}
                >
                  <svg
                    aria-label="Follow Requests"
                    className="sidebar-icon"
                    color="#ffffff"
                    fill="none"
                    height="24"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" y1="8" x2="19" y2="14"></line>
                    <line x1="22" y1="11" x2="16" y2="11"></line>
                  </svg>
                </Badge>
                <span>Requests</span>
              </NavLink>
            )}

            <button
              className={`sidebar-item sidebar-button ${
                innerActive === "newpost" ? "active" : ""
              }`}
              onClick={handleClickOpen}
            >
              {innerActive === "newpost" ? (
                <svg
                  aria-label="New post"
                  className="sidebar-icon"
                  color="#ffffff"
                  fill="#ffffff"
                  height="24"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="m12.003 5.545-.117.006-.112.02a1 1 0 0 0-.764.857l-.007.117V11H6.544l-.116.007a1 1 0 0 0-.877.876L5.545 12l.007.117a1 1 0 0 0 .877.876l.116.007h4.457l.001 4.454.007.116a1 1 0 0 0 .876.877l.117.007.117-.007a1 1 0 0 0 .876-.877l.007-.116V13h4.452l.116-.007a1 1 0 0 0 .877-.876l.007-.117-.007-.117a1 1 0 0 0-.877-.876L17.455 11h-4.453l.001-4.455-.007-.117a1 1 0 0 0-.876-.877ZM8.552.999h6.896c2.754 0 4.285.579 5.664 1.912 1.255 1.297 1.838 2.758 1.885 5.302L23 8.55v6.898c0 2.755-.578 4.286-1.912 5.664-1.298 1.255-2.759 1.838-5.302 1.885l-.338.003H8.552c-2.754 0-4.285-.579-5.664-1.912-1.255-1.297-1.839-2.758-1.885-5.302L1 15.45V8.551c0-2.754.579-4.286 1.912-5.664C4.21 1.633 5.67 1.05 8.214 1.002L8.552 1Z"></path>
                </svg>
              ) : (
                postUploadOutline
              )}
              <span>Create</span>
            </button>

            <NavLink
              to={`/${context?.auth?.username}`}
              className={`sidebar-item ${
                active === "myprofile" && !innerActive ? "active" : ""
              }`}
            >
              <img
                className="sidebar-avatar"
                src={context?.auth?.avatar ? context.auth.avatar : defaultImg}
                alt="Profile"
              />
              <span>Profile</span>
            </NavLink>
          </nav>

          <div className="sidebar-bottom">
            <button
              onClick={handleClick}
              className="sidebar-item sidebar-button"
            >
              <svg
                aria-label="Settings"
                className="sidebar-icon"
                color="#ffffff"
                fill="#ffffff"
                height="24"
                role="img"
                viewBox="0 0 24 24"
                width="24"
              >
                <line
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  x1="3"
                  x2="21"
                  y1="4"
                  y2="4"
                ></line>
                <line
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  x1="3"
                  x2="21"
                  y1="12"
                  y2="12"
                ></line>
                <line
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  x1="3"
                  x2="21"
                  y1="20"
                  y2="20"
                ></line>
              </svg>
              <span>More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Panel Backdrop - covers content area only */}
      {showSearch && (
        <div
          onClick={() => setShowSearch(false)}
          style={{
            position: "fixed",
            top: 0,
            left: "280px",
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1100,
            animation: "fadeIn 0.3s ease",
          }}
        />
      )}

      {/* Search Panel */}
      <div className={`search-panel ${showSearch ? "show" : ""}`}>
        <div className="search-panel-header">
          <h2>Search</h2>
          <button
            onClick={() => setShowSearch(false)}
            className="close-search-btn"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="search-panel-content">
          <Search />
        </div>
      </div>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorElNot}
        id="account-menu"
        open={openNot}
        onClick={handleCloseNot}
        onClose={handleCloseNot}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            width: "470px",
            minHeight: "30px",
            maxHeight: "400px",
            mt: 1.5,
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            color: "rgba(226, 232, 240, 0.95)",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <div
          style={{
            minHeight: "150px",
            maxHeight: "390px",
            display: "flex",
            flexDirection: "column",
            overflowY: "scroll",
          }}
        >
          <NotificationBox />
        </div>
      </Menu>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            width: "250px",
            mt: 1.5,
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            color: "rgba(226, 232, 240, 0.95)",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          style={{ fontSize: "13px", fontFamily: "Poppins", color: "#ffffff" }}
        >
          <Link
            to={`/${context.auth.username}`}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              color: "#ffffff",
            }}
          >
            {profileIcon}
            <span style={{ marginLeft: "12px" }}>Profile</span>
          </Link>
        </MenuItem>
        <MenuItem
          style={{ fontSize: "13px", fontFamily: "Poppins", color: "#ffffff" }}
        >
          <Link
            to="/saved/thenisab"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              color: "#ffffff",
            }}
          >
            {savedIcon}
            <span style={{ marginLeft: "12px" }}>Saved</span>
          </Link>
        </MenuItem>
        <MenuItem
          style={{ fontSize: "13px", fontFamily: "Poppins", color: "#ffffff" }}
        >
          <Link
            to="/accounts/edit"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              color: "#ffffff",
            }}
          >
            {settingsIcon}
            <span style={{ marginLeft: "12px" }}>Settings</span>
          </Link>
        </MenuItem>
        <MenuItem
          style={{ fontSize: "13px", fontFamily: "Poppins", color: "#ffffff" }}
        >
          {switchAccountIcon}
          <span style={{ marginLeft: "12px" }}>Switch accounts</span>
        </MenuItem>
        <Divider sx={{ backgroundColor: "#333" }} />
        <MenuItem
          onClick={() => logout()}
          style={{ fontSize: "13px", fontFamily: "Poppins", color: "#ffffff" }}
        >
          <span style={{ marginLeft: "7px" }}>Logout</span>
        </MenuItem>
      </Menu>

      {/* Create Post Dialog */}
      <Dialog
        maxWidth="lg"
        open={openDailog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            color: "rgba(226, 232, 240, 0.95)",
            "& .MuiDialogContent-root": {
              background: "transparent",
              color: "rgba(226, 232, 240, 0.95)",
            },
            "& .MuiDialogTitle-root": {
              color: "rgba(226, 232, 240, 0.95)",
            },
          },
        }}
      >
        <DialogTitle
          style={{
            fontFamily: "Poppins",
            textAlign: "center",
            fontSize: "15.5px",
            color: "rgba(226, 232, 240, 0.95)",
          }}
          id="alert-dialog-title"
        >
          {"Create new post"}
        </DialogTitle>
        <Divider
          style={{
            marginTop: "-10px",
            backgroundColor: "rgba(148, 163, 184, 0.2)",
          }}
        />
        <DialogContent>
          <div
            className="post"
            style={{
              width: "45vw",
              height: "70vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              margin: "auto",
            }}
          >
            {imgurl ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <div className="imageup" style={{ height: "65%" }}>
                  <img
                    style={{ width: "95%", height: "100%", margin: "auto" }}
                    src={imgurl}
                    alt=""
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "80%",
                    position: "absolute",
                    bottom: 15,
                    margin: "auto",
                  }}
                >
                  <TextField
                    id="outlined-multiline-static"
                    label="Caption"
                    multiline
                    rows={4}
                    InputProps={{
                      style: {
                        fontSize: "13.5px",
                        fontFamily: "Poppins",
                        color: "#ffffff",
                      },
                    }}
                    InputLabelProps={{
                      style: { color: "#aaa" },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#333",
                        },
                        "&:hover fieldset": {
                          borderColor: "#555",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#2196f3",
                        },
                      },
                    }}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <button
                    onClick={() => handlePost()}
                    style={{
                      border: "none",
                      outline: "none",
                      background:
                        "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      color: "white",
                      marginTop: "12px",
                      fontSize: "15px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                      transition: "all 0.2s",
                    }}
                  >
                    Upload
                  </button>
                </div>
              </div>
            ) : (
              <>
                <svg
                  style={{ marginBottom: "10px", color: "#aaa" }}
                  aria-label="Icon to represent media such as images or videos"
                  fill="currentColor"
                  height="77"
                  role="img"
                  viewBox="0 0 97.6 77.3"
                  width="96"
                >
                  <path
                    d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M84.7 18.4L58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5l-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M78.2 41.6L61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6l-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#aaa",
                    marginBottom: "15px",
                  }}
                >
                  Drag photos and videos here
                </p>
                <label
                  htmlFor="imgHandleUp"
                  style={{
                    border: "none",
                    outline: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    color: "white",
                    background:
                      "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)",
                    fontSize: "15px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  Select from computer
                </label>
                <input
                  onChange={(e) => upload(e)}
                  id="imgHandleUp"
                  type="file"
                  multiple
                  hidden
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
