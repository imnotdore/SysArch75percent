import { Navigate, useLocation, useParams } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const location = useLocation();
  const { role } = useParams(); // kukunin yung role param (resident, staff, admin)

  if (!token || !username) {
    // ✅ Walang login, redirect back to login ng tamang role
    return <Navigate to={`/${role || "resident"}/login`} state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
