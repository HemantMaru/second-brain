import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { routes } from "./app.routes";
import AIAssistant from "../Features/SaveItem/Pages/AIAssistant";

import { useDispatch } from "react-redux";
import { authSuccess, logout } from "../Features/SaveItem/auth.slices";
import { getMeAPI } from "../Features/SaveItem/services/auth.api";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getMeAPI(); // 🔥 cookie se check
        dispatch(authSuccess({ user: data.user }));
      } catch (err) {
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={routes} />
      <AIAssistant />
    </>
  );
};

export default App;
