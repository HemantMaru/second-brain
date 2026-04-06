import { createBrowserRouter } from "react-router-dom";
import SaveItem from "../Features/SaveItem/Pages/SaveItem";
import Graph from "../Features/SaveItem/Pages/Graph";
import Collection from "../Features/SaveItem/Pages/Collection";
import Analytics from "../Features/SaveItem/Pages/Analytics";
import Share from "../Features/SaveItem/Pages/Share";
import CreateNode from "../Features/SaveItem/Pages/CreateNode";
import NeuroVaultAuth from "../Features/SaveItem/Pages/NeuroVaultAuth";
import ProtectedRoute from "../Features/SaveItem/components/ProtectedRoute";

export const routes = createBrowserRouter([
  {
    path: "/auth",
    element: <NeuroVaultAuth />,
  },
  {
    path: "/saved",
    element: (
      <ProtectedRoute>
        <SaveItem />
      </ProtectedRoute>
    ),
  },
  {
    path: "/graph",
    element: <Graph />,
  },
  {
    path: "/collection",
    element: <Collection />,
  },
  {
    path: "/analytics",
    element: <Analytics />,
  },

  // 👇 IMPORTANT: "/" last me
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <CreateNode />
      </ProtectedRoute>
    ),
  },

  // 👇 fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
