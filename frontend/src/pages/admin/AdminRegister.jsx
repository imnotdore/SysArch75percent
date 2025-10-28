import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [adminExists, setAdminExists] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ------------------ Check if admin exists ------------------
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/auth/admin/check-exists`);
        setAdminExists(res.data.exists);
      } catch (err) {
        console.error("Failed to check admin existence:", err);
      }
    };
    checkAdmin();
  }, []);

  // ------------------ Form handlers ------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
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
    setSuccessMsg("");
    console.log("Submitting form:", form);

    try {
      const res = await axios.post(
        `${baseUrl}/api/auth/admin/register`,
        form,
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccessMsg(res.data.message);
      setForm({ username: "", password: "" });
      setAdminExists(true);

      // Redirect to login after 2s
      setTimeout(() => navigate("/admin/login"), 2000);
    } catch (err) {
      console.error("Admin registration error:", err);
      setErrors({
        submit:
          err.response?.data?.error ||
          "Registration failed. Check console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------ Input styles ------------------
  const inputStyle = (error) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: error ? "1px solid #e74c3c" : "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "10px",
  });

  // ------------------ JSX ------------------
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "30px",
          borderRadius: "15px",
          background: "#fff",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Admin Registration</h2>

        {adminExists ? (
          <p style={{ color: "#e74c3c" }}>
            Admin account already exists. Please log in instead.
          </p>
        ) : (
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

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={inputStyle(errors.password)}
            />
            {errors.password && (
              <p style={{ color: "#e74c3c", fontSize: "12px" }}>
                {errors.password}
              </p>
            )}

            {errors.submit && (
              <p style={{ color: "#e74c3c", fontSize: "12px" }}>
                {errors.submit}
              </p>
            )}

            {successMsg && (
              <p style={{ color: "green", fontSize: "14px", marginBottom: "10px" }}>
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || adminExists}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: isLoading || adminExists ? "#000000ff" : "#000000ff",
                color: "#fff",
                fontWeight: "bold",
                cursor: isLoading || adminExists ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Registering..." : "Register Admin"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
