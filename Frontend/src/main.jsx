import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App/index.css";
import App from "./App/App";
import { Provider } from "react-redux";
import { store } from "./App/app.store.js";
import { LoadingProvider } from "./Features/SaveItem/components/LoadingContext.jsx";
import { GlobalLoader } from "./Features/SaveItem/components/GlobalLoader.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <LoadingProvider>
        <GlobalLoader /> <App />
      </LoadingProvider>
    </Provider>
  </StrictMode>,
);
