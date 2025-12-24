import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";


import Auth from "./pages/auth";
import Chat from "./pages/chat";
import Profile from "./pages/profile";

import apiClient from "./lib/api-client";
import { GET_USER_INFO } from "./utils/constants";
import { useAppStore } from "./store";
import Home from "./pages/auth/Home";

/* -------------------- Protected Route -------------------- */
const PrivateRoute = ({ children }) => {
  const { userInfo, authChecked } = useAppStore();

  if (!authChecked) return null; // wait silently
  return userInfo ? children : <Navigate to="/auth" replace />;
};

/* -------------------- Auth-only Route -------------------- */
const AuthRoute = ({ children }) => {
  const { userInfo, authChecked } = useAppStore();

  if (!authChecked) return null;
  return userInfo ? <Navigate to="/chat" replace /> : children;
};

const App = () => {
  const { userInfo, setUserInfo, setAuthChecked } = useAppStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(GET_USER_INFO, {
          withCredentials: true,
        });

        if (res.status === 200 && res.data?.id) {
          setUserInfo(res.data);
        } else {
          setUserInfo(undefined);
        }
      } catch {
        setUserInfo(undefined);
      } finally {
        setAuthChecked(true);
      }
    };

    fetchUser();
  }, [setUserInfo, setAuthChecked]);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />

        {/* AUTH */}
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />

        {/* PROTECTED */}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
