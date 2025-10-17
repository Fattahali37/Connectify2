import React from "react";
import { useContext } from "react";
import { UserCard } from "./UserCard";
import { AuthContext } from "../../../context/Auth";
import defaultImg from "../../../assets/dafault.png";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../../../Interceptor/apiCall";
import { url } from "../../../baseUrl";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { User } from "../../dialog/User";
import AddIcon from "@mui/icons-material/Add";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../firebase";

export default function Right() {
  const { auth } = useContext(AuthContext);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [completeSuggestions, setCompleteSuggestions] = useState([]);
  const [open, setOpen] = React.useState(false);
  const context = useContext(AuthContext);

  useEffect(() => {
    api
      .get(`${url}/user/suggestions?limit=15`)
      .then((res) => {
        // console.log(res.data);
        const data = Array.isArray(res.data) ? res.data : [];
        setSuggestedUsers(data.slice(0, 5));
        setCompleteSuggestions(data);
      })
      .catch((err) => {
        console.log(err);
        setSuggestedUsers([]);
        setCompleteSuggestions([]);
      });
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function handleStoryUpload(e) {
    const file = e.target.files[0];
    if (
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png"
    ) {
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
          context.throwErr("Some error occured");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            api
              .post(`${url}/story`, {
                data: downloadURL,
              })
              .then((res) => {
                if (res.data) {
                  context.throwSuccess("story uplaoded");
                }
              })
              .catch((err) => console.log(err));
          });
        }
      );
    } else {
      context.throwErr("File type not supported");
    }
  }

  return (
    <div
      style={{
        marginTop: "15px",
        position: "sticky",
        top: "100px",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
      }}
    >
      <div
        className="my-acc"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(148, 163, 184, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          marginBottom: "20px",
        }}
      >
        <div
          className="img"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Link to={`/${auth?.username}`} style={{ position: "relative" }}>
            <img
              src={auth?.avatar ? auth.avatar : defaultImg}
              style={{
                minWidth: "60px",
                height: "60px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(59, 130, 246, 0.3)",
                transition: "all 0.3s ease",
              }}
              alt=""
              onMouseEnter={(e) => {
                e.target.style.borderColor = "rgba(59, 130, 246, 0.6)";
                e.target.style.boxShadow = "0 0 12px rgba(59, 130, 246, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
          </Link>
          <input
            onChange={(e) => handleStoryUpload(e)}
            type="file"
            id="story_up"
            hidden
          />
          <label
            htmlFor="story_up"
            title="Add new story"
            style={{
              position: "relative",
              top: "15px",
              left: "-12px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              padding: "4px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            <AddIcon sx={{ fontSize: "16px", color: "white" }} />
          </label>
          <div
            className="name"
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "18px",
            }}
          >
            <Link
              to={`/${auth?.username}`}
              style={{
                color: "rgba(226, 232, 240, 0.95)",
                fontSize: "14.75px",
                fontWeight: "600",
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
                e.target.style.webkitTextFillColor =
                  "rgba(226, 232, 240, 0.95)";
              }}
            >
              {auth?.username}
            </Link>
            <Link
              to={`/${auth?.username}`}
              style={{
                color: "rgba(148, 163, 184, 0.7)",
                fontSize: "13.5px",
                marginTop: "4.5px",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.color = "rgba(148, 163, 184, 0.9)")
              }
              onMouseLeave={(e) =>
                (e.target.style.color = "rgba(148, 163, 184, 0.7)")
              }
            >
              {auth?.name}
            </Link>
          </div>
        </div>
      </div>
      <div
        className="suggestions"
        style={{
          padding: "20px",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(148, 163, 184, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div
          className="header-suggest"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              color: "rgba(148, 163, 184, 0.9)",
              fontSize: "14.75px",
              fontWeight: "600",
            }}
          >
            Suggestions for you
          </p>
          <button onClick={() => handleClickOpen()} className="no-style">
            <p
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "14.05px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              See All
            </p>
          </button>
          <Dialog
            PaperProps={{
              style: {
                minHeight: "15%",
                maxHeight: "55%",
                minWidth: "400px",
                maxWidth: "400px",
                padding: 0,
                overflowY: "auto",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              },
            }}
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  fontWeight: "700",
                  marginTop: "-5px",
                  marginBottom: "-3px",
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {"Suggestions"}
              </p>
            </DialogTitle>
            {
              <DialogContent
                style={{ marginTop: "-9px", minHeight: "5px" }}
                dividers
              >
                {Array.isArray(completeSuggestions) &&
                  completeSuggestions.map((user) => (
                    <User key={user._id} user={user} />
                  ))}
              </DialogContent>
            }
          </Dialog>
        </div>
        <div
          className="allusers"
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {Array.isArray(suggestedUsers) &&
            suggestedUsers.map((user) => {
              return (
                <UserCard
                  key={user._id}
                  userId={user._id}
                  avatar={user.avatar}
                  username={user.username}
                  name={user.name}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
