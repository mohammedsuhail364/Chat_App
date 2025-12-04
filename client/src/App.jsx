import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Auth from "./pages/auth";
import Chat from "./pages/chat";
import Profile from "./pages/profile";

import apiClient from "./lib/api-client";
import { GET_USER_INFO } from "./utils/constants";
import { useAppStore } from "./store";

/* --------------------------------------------------------
   PROTECTED ROUTE
   - Allows only authenticated users
--------------------------------------------------------- */
const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  return userInfo ? children : <Navigate to="/auth" replace />;
};

/* --------------------------------------------------------
   ROUTE FOR LOGGED-OUT USERS
   - Prevents logged in users from accessing /auth
--------------------------------------------------------- */
const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  return userInfo ? <Navigate to="/chat" replace /> : children;
};

const App = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------------------
     FETCH USER DATA ONCE WHEN APP LOADS
     - Validates cookies/session
     - Populates store
--------------------------------------------------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO, {
          withCredentials: true,
        });

        if (response.status === 200 && response.data.id) {
          setUserInfo(response.data);
        } else {
          setUserInfo(undefined);
        }
      } catch {
        setUserInfo(undefined);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if userInfo is not set
    if (!userInfo) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  /* --------------------------------------------------------
     SHOW NOTHING UNTIL AUTH STATE IS KNOWN
     (Prevents flash of incorrect UI)
--------------------------------------------------------- */
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
