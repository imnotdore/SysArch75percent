// AboutUs.jsx
import React, { useState, useEffect } from "react";
import './AboutUs.css';
import { useNavigate } from "react-router-dom";
import { 
  FaInfoCircle,
  FaHome,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUserCheck,
  FaArrowRight,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPrint,
  FaLaptop,
  FaTools,
  FaIdCard,
  FaBell,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaWifi,
  FaShieldAlt,
  FaChartLine,
  FaHeart,
  FaStar,
  FaGlobe,
  FaBullseye,
  FaRocket,
  FaHistory,
  FaBolt
} from "react-icons/fa";

function AboutUs() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    // Disable scrolling when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (mobileMenuOpen) return;
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled, mobileMenuOpen]);

  const navItems = [
    { label: "Home", path: "/", icon: <FaHome /> },
    { label: "Services", path: "#services", icon: <FaTools /> },
    { label: "Government IDs", path: "#government-ids", icon: <FaIdCard /> },
    { label: "Announcements", path: "#announcements", icon: <FaBell /> },
    { label: "Contact", path: "#contact", icon: <FaPhone /> },
    { label: "About Us", path: "/about-us", icon: <FaInfoCircle /> }
  ];

  const barangayServices = [
    {
      icon: <FaPrint />,
      title: "Libreng Printing",
      description: "Free document printing for registered residents"
    },
    {
      icon: <FaLaptop />,
      title: "Computer Access",
      description: "Free computer and internet usage"
    },
    {
      icon: <FaTools />,
      title: "Equipment Rental",
      description: "Borrow barangay equipment for events"
    },
    {
      icon: <FaIdCard />,
      title: "ID Assistance",
      description: "Help with government ID processing"
    },
    {
      icon: <FaPhone />,
      title: "24/7 Hotline",
      description: "Emergency and assistance hotlines"
    },
    {
      icon: <FaUsers />,
      title: "Community Programs",
      description: "Various community development programs"
    }
  ];

  const barangayOfficials = [
    { position: "Punong Barangay", name: "Hon. Juan Dela Cruz" },
    { position: "Barangay Secretary", name: "Ms. Maria Santos" },
    { position: "Barangay Treasurer", name: "Mr. Roberto Lim" },
    { position: "SK Chairman", name: "Hon. Miguel Gomez" },
    { position: "Kagawad", name: "Hon. Pedro Reyes" },
    { position: "Kagawad", name: "Hon. Sofia Cruz" },
    { position: "Kagawad", name: "Hon. Antonio Lopez" }
  ];

  const facilities = [
    "Barangay Hall with Free Wi-Fi",
    "Health Center",
    "Multi-Purpose Hall",
    "Basketball Court",
    "Children's Playground",
    "Senior Citizen's Lounge",
    "Computer Lab",
    "Printing Station"
  ];

  return (
    <div className="landing-page">
      {/* HEADER */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            {/* LOGO */}
            <div className="logo" onClick={() => navigate("/")}>
              <div className="logo-image">
                <img 
                  src="/brgylogo.jpg" 
                  alt="Barangay Sto. Domingo Logo"
                  style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                />
              </div>
              <div className="logo-text">
                <h1>BARANGAY STO. DOMINGO</h1>
                <p>Quezon City</p>
              </div>
            </div>

            {/* DESKTOP NAVIGATION */}
            <nav className="desktop-nav">
              <ul className="nav-list">
                <li className="nav-item">
                  <a 
                    href="/" 
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/");
                    }}
                  >
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    href="/about-us" 
                    className="nav-link active"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/about-us");
                    }}
                  >
                    About Us
                  </a>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn-login"
                    onClick={() => navigate("/login")}
                  >
                    <FaUserCheck /> Login
                  </button>
                </li>
              </ul>
            </nav>

            {/* MOBILE MENU BUTTON */}
            <button 
              className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* MOBILE NAV OVERLAY */}
        <div 
          className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        />

        {/* MOBILE NAV SIDEBAR */}
        <div className={`mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-nav-header">
            <div className="mobile-nav-logo">
              <div className="mobile-nav-logo-img">
                <img 
                  src="/brgylogo.jpg" 
                  alt="Barangay Sto. Domingo Logo"
                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                />
              </div>
              <div className="mobile-nav-logo-text">
                <h4>BARANGAY STO. DOMINGO</h4>
                <p>Quezon City</p>
              </div>
            </div>
            <button 
              className="mobile-menu-close"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="mobile-nav-content">
            <ul className="mobile-nav-list">
              {navItems.map((item, index) => (
                <li key={index} className="mobile-nav-item">
                  <a 
                    href={item.path} 
                    className="mobile-nav-link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                      toggleMobileMenu();
                    }}
                  >
                    {item.label === "Home" && <FaHome />}
                    {item.label === "Services" && <FaTools />}
                    {item.label === "Government IDs" && <FaIdCard />}
                    {item.label === "Announcements" && <FaBell />}
                    {item.label === "Contact" && <FaPhone />}
                    {item.label === "About Us" && <FaInfoCircle />}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mobile-nav-footer">
            <button 
              className="btn-mobile-login"
              onClick={() => {
                navigate("/login");
                toggleMobileMenu();
              }}
            >
              <FaUserCheck /> Login to System
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - BARANGAY STO. DOMINGO ABOUT US PAGE */}
      <section className="about-us-section" style={{ marginTop: '70px', padding: '60px 0' }}>
        <div className="container">
          <div className="bg-white rounded-lg border shadow-xs p-6 md:p-8 md:py-16 mt-4">
            <div className="max-w-4xl mx-auto">
              
              {/* BARANGAY HEADER */}
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  About Barangay Sto. Domingo
                </h1>
                <p className="text-lg text-gray-600 italic">
                  "Serbisyong Totoo, Pangarap ng Bawat Tao"
                </p>
              </div>

              {/* MISSION SECTION */}
              <section className="mb-10">
                <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-6">
                  <FaBullseye className="mr-3 h-6 w-6 text-primary-600" />
                  Our Mission & Vision
                </h2>
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 md:p-8 mb-6">
                  <p className="text-lg text-gray-800 leading-relaxed mb-4">
                    Barangay Sto. Domingo is committed to providing <strong>quality public services</strong> to all residents. 
                    Our mission is to create a <strong>safe, clean, and united community</strong> where every resident has 
                    access to essential services and opportunities for growth.
                  </p>
                  <p className="text-lg text-gray-800 leading-relaxed">
                    We envision Barangay Sto. Domingo as a <strong>progressive community</strong> that fosters development, 
                    promotes digital literacy, and empowers every resident to achieve their dreams.
                  </p>
                </div>
              </section>

              {/* HISTORY SECTION */}
              <section className="mb-10">
                <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-6">
                  <FaHistory className="mr-3 h-6 w-6 text-primary-600" />
                  Our History
                </h2>
                <div className="bg-white border rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Established in <strong>1965</strong>, Barangay Sto. Domingo has grown from a small community into 
                    one of Quezon City's most vibrant barangays. With over <strong>25,000 residents</strong> across 
                    <strong> 35 hectares</strong>, we have continuously evolved to meet the changing needs of our community.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Through the years, we have implemented various programs and projects that have significantly 
                    improved the quality of life for our residents, from basic services to digital innovation.
                  </p>
                </div>
              </section>

              {/* SERVICES SECTION */}
              <section className="mb-10">
                <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-6">
                  <FaTools className="mr-3 h-6 w-6 text-primary-600" />
                  Our Services
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {barangayServices.map((service, index) => (
                    <div key={index} className="bg-white border rounded-lg p-6 hover:shadow-md transition-all">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 mx-auto">
                        <div className="h-6 w-6 text-primary-600">
                          {service.icon}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 text-center">
                        {service.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* OFFICIALS SECTION */}
              <section className="mb-10">
                <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-6">
                  <FaUsers className="mr-3 h-6 w-6 text-primary-600" />
                  Barangay Officials
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {barangayOfficials.map((official, index) => (
                      <div key={index} className="flex items-center p-4 bg-white rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{official.position}</h4>
                          <p className="text-gray-600">{official.name}</p>
                        </div>
                        <FaUserCheck className="text-primary-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FACILITIES SECTION */}
              <section className="mb-10">
                <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-6">
                  <FaBuilding className="mr-3 h-6 w-6 text-primary-600" />
                  Our Facilities
                </h2>
                <div className="bg-white border rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {facilities.map((facility, index) => (
                      <div key={index} className="flex items-center">
                        <FaCheckCircle className="text-green-500 mr-3" />
                        <span className="text-gray-700">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CONTACT SECTION */}
              <section className="mb-10">
                <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-6">
                  <FaPhone className="mr-3 h-6 w-6 text-primary-600" />
                  Contact Information
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-primary-50 rounded-xl p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-primary-600 mr-3" />
                        <div>
                          <p className="font-semibold">Address</p>
                          <p className="text-gray-600">Sto. Domingo Avenue, Quezon City</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaPhone className="text-primary-600 mr-3" />
                        <div>
                          <p className="font-semibold">Telephone</p>
                          <p className="text-gray-600">(02) 8925-1234</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <FaEnvelope className="text-primary-600 mr-3" />
                        <div>
                          <p className="font-semibold">Email</p>
                          <p className="text-gray-600">sksto.domingoqc@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="text-primary-600 mr-3" />
                        <div>
                          <p className="font-semibold">Office Hours</p>
                          <p className="text-gray-600">Monday-Saturday: 8:00 AM - 5:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* CALL TO ACTION */}
              <div className="bg-primary-600 rounded-lg p-8 mt-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Need Assistance?
                </h3>
                <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                  Our barangay staff is ready to serve you. Visit us or contact us for any concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    className="inline-flex items-center bg-yellow-400 text-primary-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                    onClick={() => navigate("/")}
                  >
                    <FaHome className="w-5 h-5 mr-2" />
                    Back to Home
                  </button>
                  <button 
                    className="inline-flex items-center bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                    onClick={() => navigate("/login")}
                  >
                    <FaUserCheck className="w-5 h-5 mr-2" />
                    Access Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <div className="footer-logo-circle" style={{ background: '#A43259' }}>
                  <span>SD</span>
                </div>
                <div className="footer-logo-text">
                  <h3>Barangay Sto. Domingo</h3>
                  <p>Quezon City, Metro Manila</p>
                </div>
              </div>
              <div className="contact-info">
                <p><FaMapMarkerAlt /> Sto. Domingo Avenue, Quezon City</p>
                <p><FaPhone /> (02) 8925-1234</p>
                <p><FaEnvelope />sksto.domingoqc@gmail.com</p>
                <p><FaClock /> Monday-Saturday: 8:00 AM - 5:00 PM</p>
              </div>
            </div>

            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li>
                  <a 
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/");
                    }}
                  >
                    <FaHome /> Home
                  </a>
                </li>
                <li>
                  <a 
                    href="/about-us"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/about-us");
                    }}
                  >
                    <FaInfoCircle /> About Us
                  </a>
                </li>
                <li>
                  <a 
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                  >
                    <FaUserCheck /> Login
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Connect With Us</h3>
              <div className="social-icons">
                <a href="https://web.facebook.com/profile.php?id=61553382433995" target="_blank" rel="noopener noreferrer">
                  <FaFacebook />
                </a>
              </div>
              
              <div className="emergency-contact mt-4">
                <h4>Emergency Contacts</h4>
                <p>Barangay Hall: (02) 8925-1234</p>
                <p>Police: 117 / 911</p>
                <p>Health Emergency: 8888</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Barangay Sto. Domingo Management System. All rights reserved.</p>
            <div className="footer-links-bottom">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/accessibility">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AboutUs;