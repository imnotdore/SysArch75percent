import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";

function RoleSelection() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!role) newErrors.role = "Please select a role";
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const url = `${import.meta.env.VITE_API_URL}/api/auth/${role.toLowerCase()}/login`;
      const res = await axios.post(url, form);

     // Save token and username to localStorage
localStorage.setItem("token", res.data.token);

if (res.data.username) {
  localStorage.setItem("username", res.data.username);
} else if (res.data.user?.username) {
  localStorage.setItem("username", res.data.user.username);
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
      const errorMessage =
        err.response?.data?.error || err.message || "Login failed";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to register page
  const handleRegister = () => {
    if (role) navigate(`/${role.toLowerCase()}/register`);
    else setErrors({ role: "Please select a role to register" });
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
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={inputStyle(errors.username)}
          />
          {errors.username && (
            <p style={{ color: "#e74c3c", fontSize: "12px" }}>
              {errors.username}
            </p>
          )}

          <div style={{ position: "relative" }}>
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

        <p style={{ marginTop: "15px", fontSize: "14px", color: "#555" }}>
          Don't have an account?{" "}
          <span
            onClick={handleRegister}
            style={{ color: "#A43259", cursor: "pointer", fontWeight: "bold" }}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

export default RoleSelection;
