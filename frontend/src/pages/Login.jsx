import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaEye, 
  FaEyeSlash, 
  FaLock, 
  FaIdCard, 
  FaHome, 
  FaInfoCircle, 
  FaPhoneAlt, 
  FaSignInAlt,
  FaExclamationTriangle,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaUserCheck,
   FaHandsHelping 
} from "react-icons/fa";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check for saved credentials
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setForm(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }

    return () => clearInterval(timer);
  }, []);

  // Format ang oras at petsa
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-PH', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-PH', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

    // Save username if remember me is checked
    if (rememberMe) {
      localStorage.setItem("rememberedUsername", form.username);
    } else {
      localStorage.removeItem("rememberedUsername");
    }

    setIsLoading(true);
    setErrors({});

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      
      const endpoints = [
        `${API_URL}/api/auth/resident/login`,
        `${API_URL}/api/auth/staff/login`,
        `${API_URL}/api/auth/admin/login`
      ];
      
      let res = null;
      let role = "";
      
      for (const endpoint of endpoints) {
        try {
          const attempt = await axios.post(endpoint, form);
          if (attempt.data.token) {
            res = attempt;
            
            if (endpoint.includes("/resident/")) role = "resident";
            else if (endpoint.includes("/staff/")) role = "staff";
            else if (endpoint.includes("/admin/")) role = "admin";
            
            break;
          }
        } catch (err) {
          continue;
        }
      }
      
      if (!res) {
        throw new Error("Invalid credentials or user not found");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);

      const user = res.data.user;
      if (user) {
        localStorage.setItem("username", user.username || form.username);
        localStorage.setItem("userId", user.id || "");
        
        if (role === "staff") {
          localStorage.setItem("staffId", user.staff_id || "");
          localStorage.setItem("staffName", user.name || "");
          localStorage.setItem("staffStaffId", user.staff_id || "");
        } else if (role === "admin") {
          localStorage.setItem("adminId", user.id);
        } else if (role === "resident") {
          localStorage.setItem("residentId", user.id);
          localStorage.setItem("residentName", user.full_name || "");
        }
      }

      switch (role) {
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
      console.error("Login error:", err);
      setErrors({ 
        submit: err.response?.data?.error || "Invalid credentials. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/resident/register");
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleAbout = () => {
    navigate("/about");
  };

  const handleContact = () => {
    navigate("/contact");
  };

  const handleForgotPassword = () => {
    // Placeholder for forgot password functionality
    alert("Forgot password feature will be implemented soon.");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    if (errors.submit) setErrors({ ...errors, submit: "" });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
    if (!e.target.checked) {
      localStorage.removeItem("rememberedUsername");
    }
  };

  const handlePrivacyClick = () => {
    // You can navigate to a privacy page or show a modal
    navigate("/privacy");
    // Or: alert("Privacy Policy page will be implemented soon.");
  };

  const handleTermsClick = () => {
    // You can navigate to a terms page or show a modal
    navigate("/terms");
    // Or: alert("Terms of Use page will be implemented soon.");
  };

  return (
    <div className="barangay-login-page">
      {/* Compact Top Bar */}
      <div className="barangay-top-bar">
        <div className="top-bar-content">
          <div className="time-display">
            <FaClock /> {formatTime(currentTime)} | {formatDate(currentTime)}
          </div>
          <div className="top-bar-links">
            <span><FaPhone /> (049) 123-4567</span>
            <span><FaEnvelope /> barangay@stodomingo.com</span>
          </div>
        </div>
      </div>

 {/* Header - Inayos */}
<header className="barangay-header">
  <div className="barangay-header-main">
    {/* Left Side: Logo and Title */}
    <div className="barangay-logo-container">
      <div className="barangay-logo">
        <img 
          src="/brgylogo.jpg" 
          alt="Barangay Sto. Domingo Seal" 
        />
      </div>
      
      <div className="barangay-title">
        <h1>BARANGAY STO. DOMINGO</h1>
        <p>with Sangguniang Kabataan Management System</p>
      </div>
    </div>

    {/* Center: Navigation Buttons */}
    <nav className="barangay-nav">
      <button onClick={handleHome} className="barangay-nav-btn">
        <FaHome /> Home
      </button>
      <button onClick={handleAbout} className="barangay-nav-btn">
        <FaInfoCircle /> About
      </button>
      <button onClick={handleContact} className="barangay-nav-btn">
        <FaPhoneAlt /> Contact
      </button>
    </nav>

    {/* Right Side: SK Logo */}
    <div className="sk-header-logo">
      <img 
        src="/sk.jpg"
        alt="SK Sto. Domingo Logo"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/brgylogo.jpg";
        }}
      />
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="barangay-main">
        {/* Compact Login Container */}
        <div className="barangay-login-container">

{/* Login Header */}
<div className="login-header">
  {/* Barangay Logo lang - walang SK logo */}
  <div className="login-logo">
    <img 
      src="/brgylogo.jpg"
      alt="Barangay Sto. Domingo Logo"
    />
  </div>
  
  <div className="login-title">
    <h2>BARANGAY STO. DOMINGO PORTAL</h2>
    
    
    {/* Beneficiary Note */}
    <div className="beneficiary-note">
      <FaInfoCircle />
      This system is developed in partnership with SK Sto. Domingo
    </div>
  </div>
</div>

          {/* Login Form */}
          <div className="login-body">
            <form onSubmit={handleSubmit} className="login-form">
              {/* Username Field */}
              <div className="form-group">
                <div className="input-group">
                  <input 
                    type="text"
                    name="username" 
                    placeholder="Username or Email" 
                    value={form.username} 
                    onChange={handleChange} 
                    className={`form-input ${errors.username ? 'error' : ''}`}
                  />
                </div>
                {errors.username && (
                  <div className="error-message">
                    <FaExclamationTriangle /> {errors.username}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div className="input-group">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Password" 
                    value={form.password} 
                    onChange={handleChange} 
                    className={`form-input ${errors.password ? 'error' : ''}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="password-toggle"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message">
                    <FaExclamationTriangle /> {errors.password}
                  </div>
                )}
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="login-options">
                <div className="remember-me">
                  <input 
                    type="checkbox" 
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <div className="forgot-password" onClick={handleForgotPassword}>
                  Forgot password?
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="submit-error">
                  <FaExclamationTriangle /> {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading} 
                className="submit-btn"
              >
                <FaSignInAlt />
                {isLoading ? "VERIFYING..." : "LOGIN"}
              </button>
            </form>

            {/* Registration Notice */}
            <div className="notice-box">
              <div className="notice-header">
                <FaUserCheck />
                <h4>CREATE ACCOUNT</h4>
              </div>
              <p>
                Don't have an account yet? 
                <span onClick={handleRegister} className="register-link">
                  Register here
                </span>
              </p>
            </div>

            {/* Footer Note */}
            <div className="login-footer">
              <div className="footer-line"></div>
              <p></p>
              <p className="footer-subtext">Transparent and Efficient Public Service</p>
              
              {/* Simple Footer with Privacy & Terms Links */}
              <div className="simple-footer">
                <p>
                  © {new Date().getFullYear()} Barangay Sto. Domingo System · 
                  <span onClick={handlePrivacyClick} className="footer-link"> Privacy</span> · 
                  <span onClick={handleTermsClick} className="footer-link"> Terms</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;