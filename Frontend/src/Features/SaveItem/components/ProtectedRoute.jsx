import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMeAPI } from "../services/auth.api";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await getMeAPI();
        setIsAuth(true);
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    }, 300); // 🔥 delay fix

    return () => clearTimeout(timer);
  }, []);

  if (loading || isAuth === null) return <div>Loading...</div>;

  return isAuth ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
