import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Image } from "../components/post/Image";
import { Spinner } from "../assets/Spinner";
import { url } from "../baseUrl";
import { api } from "../Interceptor/apiCall";
import { useContext } from "react";
import { AuthContext } from "../context/Auth";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Public } from "@mui/icons-material";
import { Followers } from "../components/dialog/Followers";
import Story from "../components/profile/Story";

export const Profile = ({ findStory, post = true }) => {
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const [user, setUser] = useState();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [iFollow, setIFollow] = useState(false);
  const [toggle, setToggle] = useState(1);
  const [followers, setFollowers] = useState(0);
  const [isRequested, setIsRequested] = useState(false);
  const [followButtonState, setFollowButtonState] = useState("follow");
  const params = useParams();

  useEffect(() => {
    api
      .get(`${url}/user/${params.username}`)
      .then((resp) => {
        setUser(resp.data);
        setFollowers(resp.data.followers.length);
        const isFollowing = resp.data.followers.includes(context.auth._id);
        setIFollow(isFollowing);

        // Check if request is pending - check if current user sent a request to this profile
        const requestPending = resp.data.requestReceived?.some(
          (req) => req.user.toString() === context.auth._id.toString()
        );
        setIsRequested(requestPending);

        console.log("👤 Profile Data:", {
          username: resp.data.username,
          isFollowing,
          requestPending,
          requestReceived: resp.data.requestReceived,
          currentUserId: context.auth._id
        });

        // Set button state
        if (isFollowing) {
          setFollowButtonState("unfollow");
        } else if (requestPending) {
          setFollowButtonState("requested");
        } else {
          setFollowButtonState("follow");
        }

        if (resp.data._id === context.auth._id) {
          context.handleActive("myprofile");
        } else {
          context.handleActive();
        }
      })
      .catch((err) => console.log(err));
    return () => setUser();
  }, [context, params.username]);

  useEffect(() => {
    if (!user) return;
    if (post) {
      api
        .get(`${url}/post/userpost/${user?._id}`)
        .then((data) => {
          setLoading(false);
          if (data && data.data) {
            // Handle both old and new response formats
            const postsData = Array.isArray(data.data) ? data.data : data.data.posts || [];
            setPosts(postsData);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
    if (!post) {
      api
        .get(`${url}/post/get/saved`)
        .then((data) => {
          setLoading(false);
          if (data && data.data) {
            // Handle both old and new response formats
            const postsData = Array.isArray(data.data) ? data.data : data.data.posts || [];
            setPosts(postsData);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
    return () => {
      setPosts([]);
    };
  }, [post, user]);

  async function handleFollow() {
    api
      .get(`${url}/user/handlefollow/${user._id}`)
      .then((res) => {
        if (res.data?.success) {
          const action = res.data.action;

          if (action === "followed") {
            setIFollow(true);
            setIsRequested(false);
            setFollowButtonState("unfollow");
            setFollowers((f) => f + 1);
            context.throwSuccess("Following");
          } else if (action === "unfollowed") {
            setIFollow(false);
            setIsRequested(false);
            setFollowButtonState("follow");
            setFollowers((f) => f - 1);
            context.throwSuccess("Unfollowed");
          } else if (action === "requested") {
            setIsRequested(true);
            setFollowButtonState("requested");
            context.throwSuccess("Follow request sent");
          } else if (action === "request_cancelled") {
            setIsRequested(false);
            setFollowButtonState("follow");
            context.throwSuccess("Request cancelled");
          }
        }
      })
      .catch((err) => {
        console.error(err);
        context.throwErr("Something went wrong");
      });
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = (tab) => {
    setToggle(tab);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const [openMore, setMore] = React.useState(false);

  const handleClickMenu = () => {
    setMore(true);
  };
  const handleCloseMenu = () => {
    setMore(false);
  };

  const handShake = () => {
    if (!user) return;
    api
      .post(`${url}/chat/handshake`, {
        people: [user._id],
      })
      .then((res) => {
        navigate(`/chats/${res.data.roomId}`);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="home" style={{ display: "flex", flexDirection: "column" }}>
      {/* Blocked User Notification */}
      {user?.status === "blocked" && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.95)",
            color: "#ffffff",
            padding: window.innerWidth < 768 ? "12px" : "16px",
            margin: "20px auto",
            width: window.innerWidth < 768 ? "95%" : "90%",
            maxWidth: window.innerWidth < 768 ? "100%" : "900px",
            borderRadius: "16px",
            border: "1px solid rgba(220, 38, 38, 0.5)",
            textAlign: "center",
            fontWeight: "600",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)",
          }}
        >
          ⚠️ Your account has been blocked by the admin
        </div>
      )}

      {/* Modern Profile Card */}
      <div
        style={{
          maxWidth: window.innerWidth < 768 ? "100%" : "900px",
          margin: "20px auto",
          width: window.innerWidth < 768 ? "95%" : "90%",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.7) 100%)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          padding: window.innerWidth < 768 ? "20px" : "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.6), transparent)",
          }}
        ></div>

        {/* Profile Header with Avatar and Info */}
        <div
          style={{
            display: "flex",
            flexDirection: window.innerWidth < 768 ? "column" : "row",
            alignItems: window.innerWidth < 768 ? "center" : "flex-start",
            gap: window.innerWidth < 768 ? "20px" : "40px",
            marginBottom: window.innerWidth < 768 ? "20px" : "32px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "4px",
                background:
                  "linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)",
                borderRadius: "50%",
                boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
              }}
            >
              <Story profile={true} avatar={user?.avatar} uid={user?._id} />
            </div>
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            {/* Username and Actions Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
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
                  {user?.username}
                </h1>
                {user?.private && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      background:
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "rgba(59, 130, 246, 0.95)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    PRIVATE
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                {user?._id !== context.auth._id && (
                  <button
                    onClick={() => handShake()}
                    style={{
                      padding: "10px 20px",
                      fontSize: "14px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      color: "rgba(226, 232, 240, 0.95)",
                      background:
                        "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)",
                      backdropFilter: "blur(10px)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 6px 16px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.2)";
                    }}
                  >
                    Message
                  </button>
                )}

                {user?._id === context.auth._id ? (
                  <button
                    onClick={() => navigate("/accounts/edit")}
                    style={{
                      padding: "10px 20px",
                      fontSize: "14px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      color: "rgba(226, 232, 240, 0.95)",
                      background:
                        "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)",
                      backdropFilter: "blur(10px)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 6px 16px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.2)";
                    }}
                  >
                    Edit Profile
                  </button>
                ) : followButtonState === "unfollow" ? (
                  <button
                    onClick={() => handleFollow()}
                    style={{
                      padding: "10px 20px",
                      fontSize: "14px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      color: "rgba(226, 232, 240, 0.95)",
                      background:
                        "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)",
                      backdropFilter: "blur(10px)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 6px 16px rgba(0, 0, 0, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.2)";
                    }}
                  >
                    Unfollow
                  </button>
                ) : followButtonState === "requested" ? (
                  <button
                    onClick={() => handleFollow()}
                    style={{
                      padding: "10px 20px",
                      fontSize: "14px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      border: "1px solid rgba(251, 191, 36, 0.5)",
                      color: "rgba(251, 191, 36, 0.95)",
                      background:
                        "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)",
                      backdropFilter: "blur(10px)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(251, 191, 36, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 6px 16px rgba(251, 191, 36, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(251, 191, 36, 0.2)";
                    }}
                  >
                    Requested
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow()}
                    style={{
                      padding: "10px 24px",
                      fontSize: "14px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      background:
                        "linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
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
                    Follow
                  </button>
                )}

                {user?._id === context.auth._id && (
                  <button
                    onClick={() => handleClickMenu()}
                    className="no-style"
                    style={{
                      padding: "10px",
                      borderRadius: "12px",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      background:
                        "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)",
                      backdropFilter: "blur(10px)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      aria-label="Options"
                      color="rgba(226, 232, 240, 0.95)"
                      fill="rgba(226, 232, 240, 0.95)"
                      height="20"
                      role="img"
                      viewBox="0 0 24 24"
                      width="20"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        fill="none"
                        r="8.635"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></circle>
                      <path
                        d="M14.232 3.656a1.269 1.269 0 0 1-.796-.66L12.93 2h-1.86l-.505.996a1.269 1.269 0 0 1-.796.66m-.001 16.688a1.269 1.269 0 0 1 .796.66l.505.996h1.862l.505-.996a1.269 1.269 0 0 1 .796-.66M3.656 9.768a1.269 1.269 0 0 1-.66.796L2 11.07v1.862l.996.505a1.269 1.269 0 0 1 .66.796m16.688-.001a1.269 1.269 0 0 1 .66-.796L22 12.93v-1.86l-.996-.505a1.269 1.269 0 0 1-.66-.796M7.678 4.522a1.269 1.269 0 0 1-1.03.096l-1.06-.348L4.27 5.587l.348 1.062a1.269 1.269 0 0 1-.096 1.03m11.8 11.799a1.269 1.269 0 0 1 1.03-.096l1.06.348 1.318-1.317-.348-1.062a1.269 1.269 0 0 1 .096-1.03m-14.956.001a1.269 1.269 0 0 1 .096 1.03l-.348 1.06 1.317 1.318 1.062-.348a1.269 1.269 0 0 1 1.03.096m11.799-11.8a1.269 1.269 0 0 1-.096-1.03l.348-1.06-1.317-1.318-1.062.348a1.269 1.269 0 0 1-1.03-.096"
                        fill="none"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: window.innerWidth < 768 ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
                gap: window.innerWidth < 768 ? "8px" : "12px",
                marginBottom: window.innerWidth < 768 ? "12px" : "20px",
              }}
            >
              <div
                style={{
                  padding: window.innerWidth < 768 ? "12px" : "16px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    fontSize: window.innerWidth < 768 ? "18px" : "20px",
                    fontWeight: "700",
                    color: "rgba(226, 232, 240, 0.95)",
                    marginBottom: "4px",
                  }}
                >
                  {posts?.length || 0}
                </div>
                <div
                  style={{
                    fontSize: window.innerWidth < 768 ? "12px" : "13px",
                    color: "rgba(148, 163, 184, 0.9)",
                    fontWeight: "500",
                  }}
                >
                  Posts
                </div>
              </div>

              <div
                onClick={
                  user?.private &&
                  user?._id !== context.auth._id &&
                  followButtonState !== "unfollow"
                    ? undefined
                    : () => handleClickOpen(1)
                }
                style={{
                  padding: window.innerWidth < 768 ? "12px" : "16px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor:
                    user?.private &&
                    user?._id !== context.auth._id &&
                    followButtonState !== "unfollow"
                      ? "default"
                      : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (
                    !(
                      user?.private &&
                      user?._id !== context.auth._id &&
                      followButtonState !== "unfollow"
                    )
                  ) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor =
                      "rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    !(
                      user?.private &&
                      user?._id !== context.auth._id &&
                      followButtonState !== "unfollow"
                    )
                  ) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor =
                      "rgba(148, 163, 184, 0.2)";
                  }
                }}
              >
                <div
                  style={{
                    fontSize: window.innerWidth < 768 ? "18px" : "20px",
                    fontWeight: "700",
                    color: "rgba(226, 232, 240, 0.95)",
                    marginBottom: "4px",
                  }}
                >
                  {user?.private &&
                  user?._id !== context.auth._id &&
                  followButtonState !== "unfollow"
                    ? "•"
                    : user?.followers?.length || 0}
                </div>
                <div
                  style={{
                    fontSize: window.innerWidth < 768 ? "12px" : "13px",
                    color: "rgba(148, 163, 184, 0.9)",
                    fontWeight: "500",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Followers
                </div>
              </div>

              <div
                onClick={
                  user?.private &&
                  user?._id !== context.auth._id &&
                  followButtonState !== "unfollow"
                    ? undefined
                    : () => handleClickOpen(2)
                }
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor:
                    user?.private &&
                    user?._id !== context.auth._id &&
                    followButtonState !== "unfollow"
                      ? "default"
                      : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (
                    !(
                      user?.private &&
                      user?._id !== context.auth._id &&
                      followButtonState !== "unfollow"
                    )
                  ) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor =
                      "rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    !(
                      user?.private &&
                      user?._id !== context.auth._id &&
                      followButtonState !== "unfollow"
                    )
                  ) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor =
                      "rgba(148, 163, 184, 0.2)";
                  }
                }}
              >
                <div
                  style={{
                    fontSize: window.innerWidth < 768 ? "18px" : "20px",
                    fontWeight: "700",
                    color: "rgba(226, 232, 240, 0.95)",
                    marginBottom: "4px",
                  }}
                >
                  {user?.private &&
                  user?._id !== context.auth._id &&
                  followButtonState !== "unfollow"
                    ? "•"
                    : user?.followings?.length || 0}
                </div>
                <div
                  style={{
                    fontSize: window.innerWidth < 768 ? "12px" : "13px",
                    color: "rgba(148, 163, 184, 0.9)",
                    fontWeight: "500",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Following
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {user?.name && (
              <div
                style={{
                  fontSize: window.innerWidth < 768 ? "14px" : "15px",
                  fontWeight: "600",
                  color: "rgba(226, 232, 240, 0.95)",
                  marginBottom: "8px",
                }}
              >
                {user.name}
              </div>
            )}

            {user?.bio && (
              <div
                style={{
                  fontSize: window.innerWidth < 768 ? "13px" : "14px",
                  lineHeight: "1.5",
                  color: "rgba(148, 163, 184, 0.9)",
                  marginBottom: "12px",
                }}
              >
                {user.bio}
              </div>
            )}

            {user?.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "14px",
                  color: "rgb(59, 130, 246)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgb(96, 165, 250)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgb(59, 130, 246)";
                }}
              >
                <Public fontSize="small" />
                {user.website.replace("https://", "")}
              </a>
            )}
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog
          PaperProps={{
            sx: {
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              minWidth: window.innerWidth < 768 ? "85vw" : "380px",
              overflow: "hidden",
            },
          }}
          onClose={handleCloseMenu}
          open={openMore}
        >
          <div>
            <div
              onClick={() => navigate("/accounts/reset")}
              style={{
                padding: "16px 24px",
                fontSize: "15px",
                color: "rgba(226, 232, 240, 0.95)",
                textAlign: "center",
                cursor: "pointer",
                borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                transition: "all 0.2s ease",
                background: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background =
                  "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)")
              }
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              Change password
            </div>
            <div
              onClick={() => context.logout()}
              style={{
                padding: "16px 24px",
                fontSize: "15px",
                color: "#ef4444",
                textAlign: "center",
                cursor: "pointer",
                borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
                transition: "all 0.2s ease",
                fontWeight: "600",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(239, 68, 68, 0.1)")
              }
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              Logout
            </div>
            <div
              onClick={() => handleCloseMenu()}
              style={{
                padding: "16px 24px",
                fontSize: "15px",
                color: "rgba(148, 163, 184, 0.9)",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(148, 163, 184, 0.05)")
              }
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              Cancel
            </div>
          </div>
        </Dialog>

        {/* Followers Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              borderRadius: "20px",
              minWidth: "400px",
              background:
                "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              color: "rgba(226, 232, 240, 0.95)",
            },
          }}
        >
          <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "bold",
                marginTop: "-5px",
                marginBottom: "-3px",
              }}
            >
              {toggle === 2 ? "Following" : "Followers"}
            </p>
          </DialogTitle>
          <DialogContent
            style={{ marginTop: "-9px", minHeight: "5px" }}
            dividers
          >
            <Followers
              handleClose={handleClose}
              toggle={toggle}
              userId={user?._id}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs Section */}
      <div
        style={{
          marginTop: "32px",
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: window.innerWidth < 768 ? "24px" : "48px",
            maxWidth: window.innerWidth < 768 ? "100%" : "900px",
            margin: "0 auto",
          }}
        >
          <Link
            to={`/${user?.username}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "20px 4px",
              marginTop: "-1px",
              borderTop: post
                ? "2px solid rgba(226, 232, 240, 0.95)"
                : "2px solid transparent",
              color: post
                ? "rgba(226, 232, 240, 0.95)"
                : "rgba(148, 163, 184, 0.7)",
              textDecoration: "none",
              transition: "all 0.2s ease",
              fontSize: "13px",
              fontWeight: post ? "600" : "400",
              letterSpacing: "0.5px",
            }}
          >
            <svg height="14" viewBox="0 0 24 24" width="14" fill="currentColor">
              <rect
                fill="none"
                height="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                width="18"
                x="3"
                y="3"
              ></rect>
              <line
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                x1="9.015"
                x2="9.015"
                y1="3"
                y2="21"
              ></line>
              <line
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                x1="14.985"
                x2="14.985"
                y1="3"
                y2="21"
              ></line>
              <line
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                x1="21"
                x2="3"
                y1="9.015"
                y2="9.015"
              ></line>
              <line
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                x1="21"
                x2="3"
                y1="14.985"
                y2="14.985"
              ></line>
            </svg>
            POSTS
          </Link>

          {user?._id === context.auth._id && (
            <Link
              to={`/saved/${user?.username}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "20px 4px",
                marginTop: "-1px",
                borderTop: !post
                  ? "2px solid rgba(226, 232, 240, 0.95)"
                  : "2px solid transparent",
                color: !post
                  ? "rgba(226, 232, 240, 0.95)"
                  : "rgba(148, 163, 184, 0.7)",
                textDecoration: "none",
                transition: "all 0.2s ease",
                fontSize: "13px",
                fontWeight: !post ? "600" : "400",
                letterSpacing: "0.5px",
              }}
            >
              <svg
                height="14"
                viewBox="0 0 24 24"
                width="14"
                fill="currentColor"
              >
                <polygon
                  fill="none"
                  points="20 21 12 13.44 4 21 4 3 20 3 20 21"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></polygon>
              </svg>
              SAVED
            </Link>
          )}
        </div>

        {/* Post Content */}
        <div
          style={{
            padding: window.innerWidth < 768 ? "12px" : "24px",
            maxWidth: window.innerWidth < 768 ? "100%" : "900px",
            margin: "0 auto",
          }}
        >
          {/* Show private account message for non-followers */}
          {user?.private &&
            user?._id !== context.auth._id &&
            followButtonState !== "unfollow" && (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 24px",
                  color: "rgba(148, 163, 184, 0.9)",
                }}
              >
                <div
                  style={{
                    width: window.innerWidth < 768 ? "60px" : "80px",
                    height: window.innerWidth < 768 ? "60px" : "80px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
                    border: "3px solid rgba(59, 130, 246, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                  }}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "12px",
                    color: "rgba(226, 232, 240, 0.95)",
                  }}
                >
                  This Account is Private
                </p>
                <p
                  style={{
                    fontSize: window.innerWidth < 768 ? "12px" : "14px",
                    color: "rgba(148, 163, 184, 0.7)",
                    lineHeight: "1.6",
                    maxWidth: window.innerWidth < 768 ? "280px" : "380px",
                    margin: "0 auto",
                  }}
                >
                  {followButtonState === "requested"
                    ? "You've requested to follow this account. Once they approve your request, you'll be able to see their posts."
                    : "Follow this account to see their posts, followers, and who they follow."}
                </p>
              </div>
            )}

          {/* Show loading spinner */}
          {posts.length === 0 &&
            loading &&
            !(
              user?.private &&
              user?._id !== context.auth._id &&
              followButtonState !== "unfollow"
            ) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "60px 0",
                }}
              >
                <Spinner />
              </div>
            )}

          {/* Show no posts message */}
          {posts.length === 0 &&
            !loading &&
            !(
              user?.private &&
              user?._id !== context.auth._id &&
              followButtonState !== "unfollow"
            ) && (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 24px",
                  color: "rgba(148, 163, 184, 0.9)",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  No Posts Yet
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(148, 163, 184, 0.7)",
                  }}
                >
                  {post
                    ? "When posts are shared, they will appear here."
                    : "When you save posts, they will appear here."}
                </p>
              </div>
            )}

          {/* Show posts grid */}
          {posts.length > 0 &&
            !(
              user?.private &&
              user?._id !== context.auth._id &&
              followButtonState !== "unfollow"
            ) && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "4px",
                }}
              >
                {posts.map((item) => (
                  <Image
                    key={item._id}
                    userId={item.owner}
                    postId={item._id}
                    likes={item.likes?.length || 0}
                    comments={item.comments?.length || 0}
                    src={item.image || item.files?.[0]?.link || ''}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
