import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { routes } from "./app.routes";
import AIAssistant from "../Features/SaveItem/Pages/AIAssistant";

import { useDispatch } from "react-redux";
import { authSuccess, logout } from "../Features/SaveItem/auth.slices";
import { getMeAPI } from "../Features/SaveItem/services/auth.api";

// 🚀 IMPORT CONTEXT HOOK HERE
import { useGlobalLoader } from "../Features/SaveItem/components/LoadingContext.jsx";

const App = () => {
  const dispatch = useDispatch();

  // 🚀 EXTRACT GLOBAL LOADER FUNCTIONS
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    console.log("CURRENT PATH:", window.location.pathname);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      // 🚀 LOADER CHALU KARO API CALL SE PEHLE
      showLoader();
      try {
        const data = await getMeAPI();
        dispatch(authSuccess({ user: data.user }));
      } catch {
        dispatch(logout());
      } finally {
        // 🚀 LOADER BAND KARO API CALL KE BAAD
        hideLoader();
      }
    };

    checkAuth();
  }, [dispatch, showLoader, hideLoader]); // dependencies updated

  // Return me ab loader dikhane ki zarurat nahi, GlobalLoader apne aap handle kar lega
  return (
    <>
      <RouterProvider router={routes} />
      <AIAssistant />
    </>
  );
};

export default App;
