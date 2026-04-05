import React from "react";
import { RouterProvider } from "react-router-dom";
import { routes } from "./app.routes";
import AIAssistant from "../Features/SaveItem/Pages/AIAssistant";
import Flashcard from "../Features/SaveItem/components/Flashcard";

const App = () => {
  return (
    <>
      <RouterProvider router={routes}></RouterProvider>
      <AIAssistant />
    </>
  );
};

export default App;
