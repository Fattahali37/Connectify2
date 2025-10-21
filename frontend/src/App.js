import { Sidebar } from "./components/navbar/Sidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { AuthContext } from "./context/Auth";
import { AdminAuthProvider } from "./context/AdminAuth";
import { useEffect, useState } from "react";
import { Private } from "./routers/Private";
import Redirect from "./routers/Redirect";
import AdminProtected from "./routers/AdminProtected";
import { Forgot } from "./pages/Forgot";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import toast, { Toaster } from "react-hot-toast";
import { Chat } from "./pages/Chat";
import Story from "./pages/Story";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import { api } from "./Interceptor/apiCall";
import { url } from "./baseUrl";
import io from "socket.io-client";
import { Password } from "./pages/Password";
import AuthRedirect from "./pages/AuthRedirect";
import "./theme.css";

export const socket = io(url, {
  transports: ["websocket", "polling"],
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 10,
  autoConnect: true,
});

function App() {
  const location = useLocation();
  const [auth, setAuth] = useState(JSON.parse(localStorage.getItem("user")));
  const [active, setActive] = useState("home");
  const [stories, setStories] = useState([]);

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  const throwErr = (err) => {
    toast.error(err, {
      style: {
        fontFamily: "Poppins",
        fontSize: "12.5px",
      },
    });
  };
  const throwSuccess = (msg) => {
    toast.success(msg, {
      style: {
        fontFamily: "Poppins",
        fontSize: "12.5px",
      },
    });
  };

  useEffect(() => {
    if (!auth) return;
    api
      .get(`${url}/story/home`)
      .then((res) => {
        // Ensure the response is an array
        setStories(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log(err);
        setStories([]);
      });
  }, [auth]);

  useEffect(() => {
    if (!auth) return;

    const handleConnect = () => {
      console.log("Socket connected");
      socket.emit("online", { uid: auth._id });
    };

    const handleConnectError = (error) => {
      console.log("Socket connection error:", error);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    // If already connected, emit online status
    if (socket.connected) {
      socket.emit("online", { uid: auth._id });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [auth]);

  function handleActive(page) {
    setActive(page);
  }

  const findStory = (id) => {
    console.log(id);
    const flatArr = [];
    stories.forEach((item) => {
      flatArr.push(...item);
    });
    const currentIndex = flatArr.findIndex((item) => item.id === id);
    console.log(currentIndex);
    if (currentIndex === -1) {
      return {
        prev: undefined,
        current: undefined,
        next: undefined,
      };
    }
    return {
      prev: currentIndex - 1 >= 0 ? flatArr[currentIndex - 1] : undefined,
      current: flatArr[currentIndex],
      next:
        currentIndex + 1 < flatArr.length
          ? flatArr[currentIndex + 1]
          : undefined,
    };
  };

  return (
    <AdminAuthProvider>
      <AuthContext.Provider
        value={{
          auth,
          setAuth,
          throwErr,
          throwSuccess,
          handleActive,
          findStory,
        }}
      >
        <Toaster />
        {auth && !isAdminRoute && <Sidebar active={active} />}
        <Routes>
          <Route
            path="/login"
            element={
              <Redirect>
                <Login />
              </Redirect>
            }
          />
          <Route
            path="/signup"
            element={
              <Redirect>
                <Signup />
              </Redirect>
            }
          />
          <Route path="/forgot" element={<Forgot />} />
          <Route
            path="/explore"
            element={
              <Private>
                <Explore />
              </Private>
            }
          />
          <Route
            path="/:username"
            element={
              <Private>
                <Profile />
              </Private>
            }
          />
          <Route path="/oauth/redirect" element={<AuthRedirect />} />
          <Route
            path="/chats/:id"
            element={
              <Private>
                <Chat />
              </Private>
            }
          />
          <Route
            path="/story/:userId"
            element={
              <Private>
                <Story />
              </Private>
            }
          />
          <Route
            exact
            path="/"
            element={
              <Private>
                <Home stories={stories} />
              </Private>
            }
          />

          <Route
            path="/saved/:username"
            element={
              <Private>
                <Profile post={false} />
              </Private>
            }
          />
          <Route path="/reset/:token" element={<Password />} />
          <Route
            path="/accounts/:params"
            element={
              <Private>
                <Settings />
              </Private>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtected>
                <AdminDashboard />
              </AdminProtected>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </AdminAuthProvider>
  );
}

export default App;
