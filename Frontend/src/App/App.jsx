import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { routes } from "./app.routes";
import AIAssistant from "../Features/SaveItem/Pages/AIAssistant";

import { useDispatch } from "react-redux";
import { authSuccess, logout } from "../Features/SaveItem/auth.slices";
import { getMeAPI } from "../Features/SaveItem/services/auth.api";
import { useState } from "react";

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("CURRENT PATH:", window.location.pathname);
  }, []);
  const [loading, setLoading] = useState(true);
  console.log("APP LOADED");
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getMeAPI();
        dispatch(authSuccess({ user: data.user }));
      } catch {
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <>
      <RouterProvider router={routes} />
      <AIAssistant />
    </>
  );
};

export default App;
