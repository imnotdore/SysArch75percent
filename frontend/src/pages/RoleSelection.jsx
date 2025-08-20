import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

function RoleSelection() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role first.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/${role.toLowerCase()}/login`,
        form
      );

      localStorage.setItem("token", res.data.token);

      if (role.toLowerCase() === "resident") {
        navigate("/resident/dashboard");
      } else if (role.toLowerCase() === "admin") {
        navigate("/dashboard");
      } else if (role.toLowerCase() === "staff") {
        navigate("/staff/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const handleRegister = () => {
    if (role) {
      navigate(`/${role.toLowerCase()}/register`);
    } else {
      alert("Please select a role to register.");
    }
  };

  const inputBoxStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "15px",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: 'url("/pic1.jpg")',
        backgroundSize: "cover",
        backgroundImageSize: '100%',
        backgroundPosition: 'center',
        padding: "15px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "320px",
          padding: "30px",
          borderRadius: "20px",
          background: "#ffffff0d",
          textAlign: "center",
          boxShadow: "0 15px 30px rgba(0, 0, 0, 1)",
        }}
      >
        {/* Icon Header */}
        <FaUserCircle
          style={{ fontSize: "60px", color: "#000000ff", marginBottom: "15px" }}
        />

        {/* Role Dropdown */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "white",
            color: "#333",
            cursor: "pointer",
            boxSizing: "border-box",
            marginBottom: "20px", // gap below dropdown
            transition: "border 0.1s, box-shadow 0.1s",
          }}
          onFocus={(e) => (e.target.style.border = "2px solid #c3b9b9c4")}
          onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
        >
          <option value="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="Resident">Resident</option>
        </select>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={inputBoxStyle}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={inputBoxStyle}
            required
          />
          <button
            type="submit"
            style={{
              ...inputBoxStyle,
              background: "#A43259",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "0",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            Sign In
          </button>
        </form>

        {/* Register */}
        <p style={{ marginTop: "15px", fontSize: "14px" }}>
          Don’t have an account?{" "}
          <span
            onClick={handleRegister}
            style={{
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

export default RoleSelection;
