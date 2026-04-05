import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App/index.css";
import App from "./App/App";
import { Provider } from "react-redux";
import { store } from "./App/app.store.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
