import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: select role, Step 2: login form
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputStyle = (error) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: error ? "1px solid #e74c3c" : "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "5px",
  });

  const handleRoleSelect = (e) => {
    setRole(e.target.value);
    if (errors.role) setErrors({ ...errors, role: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await axios.post(`${API_URL}/api/${role.toLowerCase()}/login`, form);

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save username
      const username = res.data.username || res.data.user?.username;
      if (username) localStorage.setItem("username", username);

      // Save staffId only if role is staff
      if (role.toLowerCase() === "staff") {
        const staffId = res.data.user?.id ?? res.data.id;
        if (!staffId) {
          setErrors({ submit: "Staff ID not returned. Contact admin." });
          setIsLoading(false);
          return;
        }
        localStorage.setItem("staffId", Number(staffId));
      }

      // Redirect
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
      setErrors({ submit: err.response?.data?.error || "Login failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("staffId");
    navigate("/");
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", backgroundImage:'url("/pic1.jpg")', backgroundSize:"cover", backgroundPosition:"center", padding:"15px" }}>
      <div style={{ width:"100%", maxWidth:"350px", padding:"30px", borderRadius:"20px", background:"rgba(255,255,255,0.95)", textAlign:"center", boxShadow:"0 15px 30px rgba(0,0,0,0.3)" }}>
        <FaUserCircle style={{ fontSize:"60px", color:"#A43259", marginBottom:"15px" }} />
        <h2 style={{ marginBottom:"20px", color:"#333" }}>{step === 1 ? "Select Your Role" : `Login as ${role}`}</h2>

        {step === 1 && (
          <>
            <select value={role} onChange={handleRoleSelect} style={inputStyle(errors.role)}>
              <option value="">-- Choose Role --</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Resident">Resident</option>
            </select>
            {errors.role && <p style={{ color:"#e74c3c", fontSize:"12px" }}>{errors.role}</p>}
            <button onClick={() => role ? setStep(2) : setErrors({ role:"Please select a role" })} style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"none", backgroundColor:"#A43259", color:"white", fontWeight:"bold", cursor:"pointer", marginTop:"10px" }}>
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <input name="username" placeholder="Username" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})} style={inputStyle(errors.username)} />
            {errors.username && <p style={{ color:"#e74c3c", fontSize:"12px" }}>{errors.username}</p>}

            <div style={{ position:"relative", marginBottom:"15px" }}>
              <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} style={inputStyle(errors.password)} />
              <span onClick={() => setShowPassword(!showPassword)} style={{ position:"absolute", right:"15px", top:"14px", cursor:"pointer", color:"#777" }}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
              {errors.password && <p style={{ color:"#e74c3c", fontSize:"12px" }}>{errors.password}</p>}
            </div>

            {errors.submit && <div style={{ color:"#e74c3c", fontSize:"14px", margin:"10px 0", padding:"10px", backgroundColor:"#fadbd8", borderRadius:"5px" }}>{errors.submit}</div>}

            <button type="submit" disabled={isLoading} style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"none", backgroundColor:isLoading?"#ccc":"#A43259", color:"white", fontWeight:"bold", cursor:isLoading?"not-allowed":"pointer", marginTop:"10px" }}>{isLoading?"Signing In...":"Login"}</button>

            <p style={{ marginTop:"15px", fontSize:"14px", color:"#555" }}>
              Don't have an account? <span onClick={()=>navigate(`/${role.toLowerCase()}/register`)} style={{ color:"#A43259", cursor:"pointer", fontWeight:"bold" }}>Register here</span>
            </p>

            <p style={{ marginTop:"10px", fontSize:"14px", color:"#555" }}>
              <span onClick={()=>setStep(1)} style={{ color:"#777", cursor:"pointer", textDecoration:"underline" }}>Back to Role Selection</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
