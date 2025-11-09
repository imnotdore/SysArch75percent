import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!role) newErrors.role = "Please select a role";
    if (!form.username.trim()) newErrors.username = "Username/Staff ID is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const loginUrl = `${baseUrl}/api/auth/${role.toLowerCase()}/login`;
      
      // Pangtesting sa mobile view (dapat yung local IP address ng computer mo yung gagamitin)
      /*const res = await axios.post(
        loginUrl.replace("localhost", "192.168.100.100"), // palitan mo nalang yung sa computer IP address mo
        form,
        { withCredentials: true }
      );*/

      const res = await axios.post(loginUrl, form);

      const { token, user } = res.data;
      if (!token) throw new Error("No token received from server");

      // Save common items
      localStorage.setItem("token", token);
      localStorage.setItem("username", user?.username || "Unknown");
      localStorage.setItem("role", role.toLowerCase());

      // Save role-specific data
      if (role.toLowerCase() === "staff") {
        localStorage.setItem("staffId", user.id);
        localStorage.setItem("staffName", user.name || "");
        localStorage.setItem("staffStaffId", user.staff_id || ""); // Save actual staff_id
      } else if (role.toLowerCase() === "admin") {
        localStorage.setItem("adminId", user.id);
      } else if (role.toLowerCase() === "resident") {
        localStorage.setItem("residentId", user.id);
        localStorage.setItem("residentName", user.full_name || "");
      }

      // Redirect based on role
      switch (role.toLowerCase()) {
        case "resident":
          navigate("/resident/dashboard");
          break;
        case "staff":
          navigate("/staff/dashboard");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login error: ", err);
      const message =
        err.response?.data?.error ||
        (err.response?.status === 404
          ? "Login route not found. Check backend URL."
          : err.message || "Login failed. Please try again.");
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    // Only allow resident registration
    if (role === "Resident") {
      navigate("/resident/register");
    } else if (role === "Staff") {
      setErrors({ 
        submit: "Staff accounts are created by administrators only. Please contact your admin." 
      });
    } else if (role === "Admin") {
      setErrors({ 
        submit: "Admin registration is not available through this portal." 
      });
    } else {
      setErrors({ role: "Please select a role to register" });
    }
  };

  // Get placeholder text based on selected role
  const getUsernamePlaceholder = () => {
    if (role === "Staff") return "Staff ID or Username";
    return "Username";
  };

  const inputStyle = (error) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: error ? "1px solid #e74c3c" : "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "5px",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: 'url("/pic1.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "15px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "350px",
          padding: "30px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.95)",
          textAlign: "center",
          boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
        }}
      >
        <FaUserCircle
          style={{ fontSize: "60px", color: "#A43259", marginBottom: "15px" }}
        />
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Welcome Back</h2>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            if (errors.role) setErrors({ ...errors, role: "" });
            if (errors.submit) setErrors({ ...errors, submit: "" });
          }}
          style={inputStyle(errors.role)}
        >
          <option value="">Select Your Role</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="Resident">Resident</option>
        </select>
        {errors.role && (
          <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.role}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder={getUsernamePlaceholder()}
            value={form.username}
            onChange={handleChange}
            style={inputStyle(errors.username)}
          />
          {errors.username && (
            <p style={{ color: "#e74c3c", fontSize: "12px" }}>
              {errors.username}
            </p>
          )}

          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={inputStyle(errors.password)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "14px",
                cursor: "pointer",
                color: "#777",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && (
              <p style={{ color: "#e74c3c", fontSize: "12px" }}>
                {errors.password}
              </p>
            )}
          </div>

          {errors.submit && (
            <div
              style={{
                color: "#e74c3c",
                fontSize: "14px",
                margin: "10px 0",
                padding: "10px",
                backgroundColor: "#fadbd8",
                borderRadius: "5px",
              }}
            >
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: isLoading ? "#ccc" : "#A43259",
              color: "white",
              fontWeight: "bold",
              cursor: isLoading ? "not-allowed" : "pointer",
              marginTop: "10px",
            }}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Show register link only for residents */}
        {role === "Resident" && (
          <p style={{ marginTop: "15px", fontSize: "14px", color: "#555" }}>
            Don't have an account?{" "}
            <span
              onClick={handleRegister}
              style={{ color: "#A43259", cursor: "pointer", fontWeight: "bold" }}
            >
              Register here
            </span>
          </p>
        )}

        {/* Show message for staff/admin */}
        {(role === "Staff" || role === "Admin") && (
          <p style={{ 
            marginTop: "15px", 
            fontSize: "14px", 
            color: "#666",
            fontStyle: "italic" 
          }}>
            {role === "Staff" 
              ? "Staff accounts are created by administrators" 
              : "Admin accounts are pre-configured"}
          </p>
        )}

        {/* Show instruction when no role selected */}
        {!role && (
          <p style={{ 
            marginTop: "15px", 
            fontSize: "14px", 
            color: "#666",
            fontStyle: "italic" 
          }}>
            Select your role to continue
          </p>
        )}
      </div>
    </div>
  );
}