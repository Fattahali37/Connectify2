import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import ChatBox from "../components/chat/ChatBox";
import RoomName from "../components/chat/RoomName";
import { api } from "../Interceptor/apiCall";
import { Default } from "../components/chat/Default";
import { useParams } from "react-router-dom";
import { url } from "../baseUrl";
import { Dialog, DialogTitle } from "@mui/material";
import Select from "../components/chat/Select";
import CloseIcon from "@mui/icons-material/Close";
import { useContext } from "react";
import { AuthContext } from "../context/Auth";

export const Chat = () => {
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = React.useState(false);
  const params = useParams();
  const context = useContext(AuthContext);

  useEffect(() => {
    api
      .get(`${url}/chat/getrooms`)
      .then((res) => {
        setRooms(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log(err);
        setRooms([]);
      });
  }, []);

  useEffect(() => {
    context.handleActive("chat");
  }, [context]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  function addRoom(room) {
    const present = rooms.filter((item) => item.roomId === room.roomId);
    if (present.length !== 0) return;
    setRooms((prev) => [...prev, room]);
  }

  function deleteRoom(roomId) {
    setRooms((prev) => prev.filter((item) => item.roomId !== roomId));
  }

  return (
    <div
      className="chatpage"
      style={{
        width: "calc(100% - 280px)",
        marginLeft: "280px",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        border: "none",
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        borderRadius: "0",
        position: "relative",
      }}
    >
      <div
        className="left_chat_bar"
        style={{
          width: "420px",
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(148, 163, 184, 0.1)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="username"
          style={{
            borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
            width: "100%",
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg, rgba(59, 130, 246, 0.03) 0%, transparent 100%)",
            padding: "0 24px",
          }}
        >
          <p
            style={{
              fontWeight: "700",
              fontSize: "18px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.5px",
            }}
          >
            {"Messages"}
          </p>
          <button
            onClick={handleClickOpen}
            className="no_style"
            style={{
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "12px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg
              style={{ color: "rgba(226, 232, 240, 0.9)" }}
              aria-label="New message"
              className="_ab6-"
              fill="currentColor"
              height="24"
              role="img"
              viewBox="0 0 24 24"
              width="24"
            >
              <path
                d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
              <path
                d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
              <line
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                x1="16.848"
                x2="20.076"
                y1="3.924"
                y2="7.153"
              ></line>
            </svg>
          </button>
          <Dialog
            PaperProps={{
              style: {
                minHeight: "55%",
                maxHeight: "65%",
                minWidth: "400px",
                maxWidth: "400px",
                padding: 0,
                overflowY: "auto",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              },
            }}
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle
              id="customized-dialog-title"
              onClose={handleClose}
              style={{
                borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                height: "60px",
                padding: "20px 24px",
                background:
                  "linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)",
              }}
            >
              <CloseIcon
                sx={{
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "rgba(226, 232, 240, 0.9)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "#ef4444",
                    transform: "rotate(90deg)",
                  },
                }}
                onClick={handleClose}
              />
              <p
                style={{
                  textAlign: "center",
                  fontSize: "16px",
                  fontWeight: "700",
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {"New Message"}
              </p>
              <p> &nbsp; </p>
            </DialogTitle>
            <Select addRoom={addRoom} handleClose={handleClose} />
          </Dialog>
        </div>
        {Array.isArray(rooms) &&
          rooms.map((item) => (
            <RoomName key={item.roomId} roomId={item.roomId} />
          ))}
      </div>
      <div className="right_chatbar" style={{ width: "67%" }}>
        {params.id === "all" ? (
          <Default />
        ) : (
          <ChatBox deleteRoom={deleteRoom} roomId={params.id} />
        )}
      </div>
    </div>
  );
};
