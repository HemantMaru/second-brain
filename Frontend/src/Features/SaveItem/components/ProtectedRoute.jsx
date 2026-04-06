import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
