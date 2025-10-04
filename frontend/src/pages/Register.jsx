import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const { role } = useParams(); // "staff" or "resident"
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    ...(role === "staff" && { name: "", contact: "" }),
    ...(role === "resident" && {
      full_name: "",
      age: "",
      address: "",
      gender: "male",
      contact: "",
      civil_status: "",
      youth_classification: "",
      education: "",
      registered_sk: "",
      registered_national: "",
    }),
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const inputStyle = (error) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: error ? "1px solid #e74c3c" : "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "5px",
  });

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

    if (role === "staff") {
      if (!form.name.trim()) newErrors.name = "Name is required";
    }

    if (role === "resident") {
      if (!form.full_name.trim()) newErrors.full_name = "Full Name is required";
      if (!form.age) newErrors.age = "Age is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage("");
    setErrors({});

    try {
      const registerUrl = `${baseUrl}/api/auth/${role.toLowerCase()}/register`;

      // Filter form to only include non-empty values
      const filteredForm = {};
      for (const key in form) {
        if (form[key] !== "" && form[key] !== null && form[key] !== undefined) {
          filteredForm[key] = form[key];
        }
      }

      const res = await axios.post(registerUrl, filteredForm);

      setMessage(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`);

      // Reset form
      setForm({
        username: "",
        password: "",
        ...(role === "staff" && { name: "", contact: "" }),
        ...(role === "resident" && {
          full_name: "",
          age: "",
          address: "",
          gender: "male",
          contact: "",
          civil_status: "",
          youth_classification: "",
          education: "",
          registered_sk: "",
          registered_national: "",
        }),
      });

      // Redirect after 2 seconds
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response)
        setErrors({ submit: err.response.data.error || "Registration failed" });
      else if (err.request) setErrors({ submit: "No response from server" });
      else setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

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
          maxWidth: "500px",
          padding: "30px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.95)",
          textAlign: "center",
          boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
        }}
      >
        <FaUserCircle style={{ fontSize: "60px", color: "#A43259", marginBottom: "15px" }} />

        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          {role.charAt(0).toUpperCase() + role.slice(1)} Registration
        </h2>

        <form onSubmit={handleSubmit}>
          {role === "staff" && (
            <>
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                style={inputStyle(errors.name)}
              />
              {errors.name && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.name}</p>}

              <input
                name="contact"
                placeholder="Contact"
                value={form.contact}
                onChange={handleChange}
                style={inputStyle(errors.contact)}
              />
            </>
          )}

          {role === "resident" && (
            <>
              <input
                name="full_name"
                placeholder="Full Name"
                value={form.full_name}
                onChange={handleChange}
                style={inputStyle(errors.full_name)}
              />
              {errors.full_name && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.full_name}</p>}

              <input
                type="date"
                name="birthday"
                value={form.birthday || ""}
                onChange={(e) => {
                  handleChange(e);
                  const birthDate = new Date(e.target.value);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const m = today.getMonth() - birthDate.getMonth();
                  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                  if (age > 30) {
                    setErrors((prev) => ({ ...prev, birthday: "You must be 30 years old or younger" }));
                  } else {
                    setErrors((prev) => ({ ...prev, birthday: "" }));
                  }
                  setForm((prev) => ({ ...prev, age }));
                }}
                style={inputStyle(errors.birthday)}
              />
              {errors.birthday && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.birthday}</p>}

              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                style={inputStyle()}
              />

              <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle()}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <input
                name="contact"
                placeholder="Contact Number"
                value={form.contact}
                onChange={handleChange}
                style={inputStyle()}
              />

              <select name="civil_status" value={form.civil_status} onChange={handleChange} style={inputStyle()}>
                <option value="">Civil Status</option>
                <option>Single</option>
                <option>Married</option>
                <option>Widowed</option>
                <option>Divorced</option>
              </select>

              <select name="youth_classification" value={form.youth_classification} onChange={handleChange} style={inputStyle()}>
                <option value="">Youth Classification</option>
                <option>In School Youth</option>
                <option>Out of School Youth</option>
                <option>Working Youth</option>
                <option>Youth w/ Specific Needs</option>
                <option>Children in Conflict with Law</option>
                <option>Indigenous People</option>
                <option>Person with Disability</option>
              </select>

              <select name="education" value={form.education} onChange={handleChange} style={inputStyle()}>
                <option value="">Educational Background</option>
                <option>Elementary Level</option>
                <option>Elementary Graduate</option>
                <option>Highschool Level</option>
                <option>Highschool Graduate</option>
                <option>College Level</option>
                <option>College Graduate</option>
                <option>Vocational Graduate</option>
                <option>Masters</option>
                <option>Doctorate</option>
              </select>

              <select name="registered_sk" value={form.registered_sk} onChange={handleChange} style={inputStyle()}>
                <option value="">Registered SK Voter?</option>
                <option>Yes</option>
                <option>No</option>
              </select>

              <select name="registered_national" value={form.registered_national} onChange={handleChange} style={inputStyle()}>
                <option value="">Registered National Voter?</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </>
          )}

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={inputStyle(errors.username)}
          />
          {errors.username && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.username}</p>}

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
              style={{ position: "absolute", right: "15px", top: "14px", cursor: "pointer", color: "#777" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.password}</p>}
          </div>

          {errors.submit && (
            <div style={{ color: "#e74c3c", fontSize: "14px", marginBottom: "15px", padding: "10px", backgroundColor: "#fadbd8", borderRadius: "5px" }}>
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
              marginBottom: "15px",
            }}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && <p style={{ color: "green", marginTop: "10px" }}>{message}</p>}
      </div>
    </div>
  );
}

export default Register;
