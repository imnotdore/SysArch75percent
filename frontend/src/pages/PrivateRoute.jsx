import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("role"); // store user role on login
  const location = useLocation();

  if (!token || !username) {
    // Not logged in
    return <Navigate to={`/${role || "resident"}/login`} state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    // Logged in but wrong role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
