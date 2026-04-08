import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // if (loading) {
  //   return (
  //     <div className="loader-container">
  //       <div className="orbital-spinner">
  //         <div className="orbital-ring"></div>
  //         <div className="orbital-ring"></div>
  //         <div className="orbital-ring"></div>
  //         <div className="orbital-core"></div>
  //       </div>
  //     </div>
  //   );
  // }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
