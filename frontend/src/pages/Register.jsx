import { useState, useEffect } from "react";
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
      birthday: "",
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

  const [idPicture, setIdPicture] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warningModal, setWarningModal] = useState(false); // For back/reload warning

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Prevent back button & reload
  useEffect(() => {
    // Push state to prevent back navigation
    window.history.pushState(null, null, window.location.href);

    const handleBack = () => {
      window.history.pushState(null, null, window.location.href);
      setWarningModal(true); // Show warning modal
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      setWarningModal(true);
      return "";
    };

    window.addEventListener("popstate", handleBack);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handleBack);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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

    // Common fields
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (role === "staff") {
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.contact.trim()) newErrors.contact = "Contact is required";
    }

    if (role === "resident") {
      // All fields required
      if (!form.full_name.trim()) newErrors.full_name = "Full Name is required";
      if (!form.birthday) newErrors.birthday = "Birthday is required";
      if (!form.address.trim()) newErrors.address = "Address is required";
      if (!form.gender) newErrors.gender = "Gender is required";
      if (!form.contact.trim()) newErrors.contact = "Contact is required";
      if (!form.civil_status) newErrors.civil_status = "Civil Status is required";
      if (!form.youth_classification)
        newErrors.youth_classification = "Youth Classification is required";
      if (!form.education) newErrors.education = "Education is required";
      if (!form.registered_sk) newErrors.registered_sk = "SK registration info is required";
      if (!form.registered_national)
        newErrors.registered_national = "National registration info is required";
      if (!idPicture) newErrors.idPicture = "ID picture is required";

      // Age validation
      if (form.age < 13 || form.age > 30)
        newErrors.age = "Only residents aged 13 to 30 can register";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  setErrors({});

  try {
    const registerUrl = `${baseUrl}/api/auth/${role.toLowerCase()}/register`;

    // Filter out empty/null/undefined fields
    const filteredForm = {};
    for (const key in form) {
      if (form[key] !== "" && form[key] !== null && form[key] !== undefined) {
        filteredForm[key] = form[key];
      }
    }

    if (role === "resident") {
      // Residents need FormData because of file upload
      const formData = new FormData();
      for (const key in filteredForm) formData.append(key, filteredForm[key]);
      if (idPicture) formData.append("id_picture", idPicture);

      await axios.post(registerUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      // Admin & Staff can just send JSON
      await axios.post(registerUrl, filteredForm); // Content-Type: application/json
    }

    setShowModal(true);

    // Reset form
    setForm({
      username: "",
      password: "",
      ...(role === "staff" && { name: "", contact: "" }),
      ...(role === "resident" && {
        full_name: "",
        age: "",
        birthday: "",
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
    setIdPicture(null);
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
          {/* STAFF FORM */}
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
              {errors.contact && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.contact}</p>}
            </>
          )}

          {/* RESIDENT FORM */}
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
                  setForm((prev) => ({ ...prev, age }));
                }}
                style={inputStyle(errors.birthday || errors.age)}
              />
              {errors.age && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.age}</p>}

              <input
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                style={inputStyle(errors.address)}
              />
              {errors.address && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.address}</p>}

              <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle(errors.gender)}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.gender}</p>}

              <input
                name="contact"
                placeholder="Contact Number"
                value={form.contact}
                onChange={handleChange}
                style={inputStyle(errors.contact)}
              />
              {errors.contact && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.contact}</p>}

              {/* ... include all other select inputs similarly with error display ... */}

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", textAlign: "left", fontWeight: "bold", marginBottom: "5px" }}>
                  Upload ID Picture:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdPicture(e.target.files[0])}
                  style={inputStyle(errors.idPicture)}
                />
                {errors.idPicture && <p style={{ color: "#e74c3c", fontSize: "12px" }}>{errors.idPicture}</p>}
              </div>
            </>
          )}

          {/* Username & Password */}
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={inputStyle(errors.username)}
          />
          {errors.username && <p style={{ color: "#1b0402ff", fontSize: "12px" }}>{errors.username}</p>}

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

         {/* ...existing form elements... */}

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

{/* Back to Login link */}
<div style={{ textAlign: "center", marginTop: "10px" }}>
  <button
    onClick={() => navigate("/login")}
    style={{
      background: "none",
      border: "none",
      color: "#2600ffff",
      cursor: "pointer",
      textDecoration: "underline",
      fontSize: "14px",
      fontWeight: "bold",
    }}
  >
    Back to Login
  </button>
</div>

        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
        }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "10px", textAlign: "center", maxWidth: "400px" }}>
            <h2>Registration Submitted</h2>
            <p>Your registration will be reviewed. Kindly wait for your account to be approved.</p>
            <button onClick={() => navigate("/")} style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}>OK</button>
          </div>
        </div>
      )}

      {/* Back/Reload Warning Modal */}
     
    </div>
  );
}

export default Register;
