import '@smastrom/react-rating/style.css';

import React , {useContext,useEffect}from "react";
import logo from "./assets/logo.png"; 
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Register from "./page/auth/Register.jsx";
import Login from "./page/auth/Login.jsx";
import HomePage from "./page/HomePage.jsx";
import ComplaintForm from "./page/Citizen/ComplaintForm.jsx";
import AdminDashboard from "./page/Admin/AdminDashboard.jsx";
import StaffDashboard from "./page/Staff/StaffDashboard.jsx";
import CitizenDashboard from "./page/Citizen/CitizenDashboard.jsx";
// import StaffPerformance from "./page/Admin/StaffPerformance.jsx";
import ProtectedRoute from "./routes/protectedRoute.jsx";


//Notification
import Messaging from "./Firebase/Messaging.jsx";
import { onMessage } from "firebase/messaging";
import { messaging } from "./Firebase/firebase";
import { requestPermission } from "./Firebase/requestPermission";

import AuthProvider from "./context/AuthContext.jsx";
import {UserContext} from "./context/AuthContext.jsx";

function NotificationHandler() {
  const { user } = useContext(UserContext);
  // const location = useLocation();
  // const { role, token } = useContext(UserContext);

  useEffect(() => {
    if (user && user.id) { // Only request permission if user is logged in
      requestPermission(user.id); // Call your existing function
    } else {
      console.log("User not logged in, skipping notification permission request.");
    }


    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received in App.jsx:", payload);
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
        });
      }
    });
    return () => unsubscribe(); // Cleanup

  // Notification.requestPermission().then(permission => {
  //   if (permission === "granted") {
  //     messaging.getToken({ vapidKey: YOUR_VAPID_KEY })
  //       .then(token => {
  //         api.saveFcmToken(user.id, token);
  //       })
  //       .catch(err => console.error("Error getting FCM token:", err));
  //   }
  // });
  // const unsubscribe = onMessage(messaging, payload => {
  //   console.log("Foreground message", payload);
  //   if (payload.notification) {
  //     new Notification(payload.notification.title, {
  //       body: payload.notification.body,
  //     });
  //   }
  // });
  // return unsubscribe;
}, [user]);
return null;
}

// POWER RANGERS COLORS
const COLORS = {
  red: "#D4181F",
  pink: "#E755AF",
  blue: "#2B4CB3",
  yellow: "#F4D000",
  black: "#0A0A0A",
  white: "#FFFFFF",
  silver: "#D9D9D9",
};

// 🔹 Auth Buttons Component
export function AuthButtons() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    navigate("/login");
  };

  const buttonBase = {
    padding: "8px 16px",
    fontWeight: "700",
    borderRadius: "6px",
    border: `2px solid ${COLORS.yellow}`,
    textDecoration: "none",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "0.3s",
    color: COLORS.yellow,
    background: "rgba(0,0,0,0.28)",
    backdropFilter: "blur(5px)",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {!token ? (
        <>
          <Link
            to="/register"
            style={buttonBase}
            onMouseEnter={(e) => (e.target.style.background = COLORS.red)}
            onMouseLeave={(e) => (e.target.style.background = "rgba(0,0,0,0.28)")}
          >
            Register
          </Link>

          <Link
            to="/login"
            style={buttonBase}
            onMouseEnter={(e) => (e.target.style.background = COLORS.blue)}
            onMouseLeave={(e) => (e.target.style.background = "rgba(0,0,0,0.28)")}
          >
            Login
          </Link>
        </>
      ) : (
        <>
          

          <button
            onClick={handleLogout}
            style={{
              ...buttonBase,
              background: COLORS.red,
              color: COLORS.white,
            }}
            onMouseEnter={(e) => (e.target.style.background = COLORS.black)}
            onMouseLeave={(e) => (e.target.style.background = COLORS.red)}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}

// ⭐ NAVBAR COMPONENT (FIXED + TRANSPARENT + NEON)
function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "72px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 24px",
        background: "rgba(0, 0, 0, 0.14)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: `2px solid ${COLORS.yellow}`,
        boxShadow: `0 0 14px rgba(244,208,0,0.30)`,
        zIndex: 99999,
      }}
    >

      {/* 🔹 Centered LOGO */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: "70px",
            width:"800px",
            objectFit: "contain",
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
          }}
        />
      </div>
      <AuthButtons/>

   
    </nav>
  );
}

// ⭐ MAIN APP
export default function App() {
  return (
    <Router>
         <AuthProvider>
      {/* Navbar outside pages, fixed at top */}
      <Navbar />
      <NotificationHandler/>
       {/* <Messaging/> */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard/citizen"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/staff"
          element={
            <ProtectedRoute allowedRoles={["staff", "officer"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/dashboard/admin/staff-performance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              {/* <StaffPerformance /> */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaint/new"
          element={
            <ProtectedRoute allowedRoles={["citizen"]}>
              <ComplaintForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<h1 style={{ color: COLORS.red }}>⚠ Page Not Found</h1>}
        />
      </Routes>
      </AuthProvider>
    </Router>
  );
}
