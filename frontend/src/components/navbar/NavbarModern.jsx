import React, { useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Explore as ExploreIcon,
  Chat as ChatIcon,
  FavoriteBorder as FavoriteIcon,
  AddCircleOutline as AddIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Bookmark as BookmarkIcon,
} from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from "@mui/material";
import { AuthContext } from "../../context/Auth";
import { url } from "../../baseUrl";
import { api } from "../../Interceptor/apiCall";
import defaultImg from "../../assets/dafault.png";
import { NotificationBox } from "../dialog/NotificationBox";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase";

export const NavbarModern = ({ active }) => {
  const context = useContext(AuthContext);
  const [imgurl, setImgurl] = useState("");
  const [caption, setCaption] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const logout = async () => {
    api
      .post(`${url}/auth/logout`, {
        token: localStorage.getItem("refresh_token"),
      })
      .then((resp) => {
        if (resp.data) {
          localStorage.clear();
          window.location.reload();
          context.setAuth(null);
        }
      })
      .catch((err) => console.log(err));
  };

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
      files: [{ fileType: "image", link: imgurl }],
    };
    api.post(`${url}/post/create`, data).then((res) => {
      if (res.data) {
        context.throwSuccess("Posted");
        setOpenDialog(false);
        setImgurl("");
        setCaption("");
        context.newpost(res.data);
      }
    });
  };

  return (
    <>
      {/* Modern Glassmorphic Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-xl">C</span>
              </div>
              <span className="hidden md:block text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Connectify
              </span>
            </Link>

            {/* Center Navigation Icons */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `p-3 rounded-xl transition-all duration-200 ${
                    isActive || active === "home"
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`
                }
              >
                <HomeIcon />
              </NavLink>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  searchOpen
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <SearchIcon />
              </button>

              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `p-3 rounded-xl transition-all duration-200 ${
                    isActive || active === "explore"
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`
                }
              >
                <ExploreIcon />
              </NavLink>

              <NavLink
                to="/chats/all"
                className={({ isActive }) =>
                  `p-3 rounded-xl transition-all duration-200 ${
                    isActive || active === "chat"
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`
                }
              >
                <Badge badgeContent={0} color="error">
                  <ChatIcon />
                </Badge>
              </NavLink>

              <button
                onClick={(e) => setNotificationAnchor(e.currentTarget)}
                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <Badge badgeContent={0} color="error">
                  <FavoriteIcon />
                </Badge>
              </button>

              <button
                onClick={() => setOpenDialog(true)}
                className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
              >
                <AddIcon />
              </button>
            </div>

            {/* Right Side - Profile */}
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all duration-200"
              >
                <Avatar
                  src={context?.auth?.avatar || defaultImg}
                  alt={context?.auth?.username}
                  sx={{ width: 32, height: 32 }}
                />
                <span className="hidden md:block text-white font-medium">
                  {context?.auth?.username}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar (Expandable) */}
        {searchOpen && (
          <div className="border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
            <div className="max-w-2xl mx-auto px-4 py-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
          </div>
        )}
      </nav>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            backgroundColor: "#1e293b",
            color: "#fff",
            borderRadius: "12px",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            minWidth: 220,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            window.location.href = `/${context.auth.username}`;
          }}
          sx={{ fontSize: "14px", py: 1.5 }}
        >
          <ProfileIcon sx={{ mr: 2, fontSize: 20 }} /> Profile
        </MenuItem>
        <MenuItem
          onClick={() => setAnchorEl(null)}
          sx={{ fontSize: "14px", py: 1.5 }}
        >
          <BookmarkIcon sx={{ mr: 2, fontSize: 20 }} /> Saved
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            window.location.href = "/accounts/edit";
          }}
          sx={{ fontSize: "14px", py: 1.5 }}
        >
          <SettingsIcon sx={{ mr: 2, fontSize: 20 }} /> Settings
        </MenuItem>
        <Divider sx={{ my: 1, backgroundColor: "rgba(148, 163, 184, 0.1)" }} />
        <MenuItem
          onClick={logout}
          sx={{ fontSize: "14px", py: 1.5, color: "#ef4444" }}
        >
          <LogoutIcon sx={{ mr: 2, fontSize: 20 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1,
            backgroundColor: "#1e293b",
            color: "#fff",
            borderRadius: "12px",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        <div className="p-2">
          <NotificationBox />
        </div>
      </Menu>

      {/* Create Post Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: "#1e293b",
            borderRadius: "16px",
            border: "1px solid rgba(148, 163, 184, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#fff",
            borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
          }}
        >
          Create New Post
        </DialogTitle>
        <DialogContent sx={{ mt: 2, minWidth: 500, minHeight: 400 }}>
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            {imgurl ? (
              <div className="w-full space-y-4">
                <img src={imgurl} alt="Preview" className="w-full rounded-xl" />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(148, 163, 184, 0.3)" },
                      "&:hover fieldset": {
                        borderColor: "rgba(148, 163, 184, 0.5)",
                      },
                      "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                    },
                  }}
                />
                <button
                  onClick={handlePost}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200"
                >
                  Post
                </button>
              </div>
            ) : (
              <>
                <div className="text-center text-slate-400">
                  <svg
                    className="mx-auto mb-4"
                    width="96"
                    height="96"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 4h16v16H4z" opacity="0.3" />
                    <path d="M21 5v14H3V5h18m0-2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-11 7l2.03 2.71L15 11l3 4H6l3-4z" />
                  </svg>
                  <p className="text-lg mb-4">Select a photo to share</p>
                </div>
                <label className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl cursor-pointer transition-all duration-200">
                  Choose Photo
                  <input
                    type="file"
                    onChange={upload}
                    hidden
                    accept="image/*"
                  />
                </label>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};
