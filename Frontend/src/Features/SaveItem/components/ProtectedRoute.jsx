import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMeAPI } from "../services/auth.api";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(null); // 🔥 change

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getMeAPI();
        setIsAuth(true);
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading || isAuth === null) return <div>Loading...</div>;

  if (!isAuth) return <Navigate to="/auth" replace />;

  return children;
};

export default ProtectedRoute;
