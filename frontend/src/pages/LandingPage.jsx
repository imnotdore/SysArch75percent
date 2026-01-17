import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaInfoCircle,
  FaPrint, 
  FaLaptop, 
  FaCalendarAlt, 
  FaUsers, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram,
  FaSignInAlt,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaFileAlt,
  FaExclamationCircle,
  FaHome,
  FaUserTie,
  FaTools,
  FaCertificate,
  FaClipboardList,
  FaArrowRight,
  FaCheckCircle,
  FaUserPlus,
  FaFileUpload,
  FaCalendarCheck,
  FaDownload,
  FaStepForward,
  FaRegClock,
  FaClipboardCheck,
  FaHandshake,
  FaSearch,
  FaBell,
  FaNewspaper,
  FaBullhorn,
  FaPoll,
  FaCommentDots,
  FaChartBar,
  FaDatabase,
  FaShieldAlt,
  FaMobileAlt,
  FaQrcode,
  FaCalendarDay,
  FaRegCalendarCheck,
  FaMoneyBillWave,
  FaRegFilePdf,
  FaEye,
  FaLock,
  FaUserCheck,
  FaExclamationTriangle,
  FaHistory,
  FaRegStar,
  FaRegChartBar,
  FaWifi,
  FaCloudUploadAlt,
  FaCloudSun,
  FaCloudRain,
  FaSun,
  FaIdCard,
  FaPassport,
  FaCar,
  FaDesktop,
  FaMicrophone,
  FaChair,
  FaChevronDown,
  FaChevronUp,
  FaCloud,
  FaClock   
} from "react-icons/fa";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  
  const [weatherData, setWeatherData] = useState({
    temperature: "25",
    condition: "Sunny",
    humidity: "65",
    manila: { temp: "--", condition: "Loading...", humidity: "--", icon: <FaCloudSun /> },
    cebu: { temp: "--", condition: "Loading...", humidity: "--", icon: <FaCloudSun /> },
    davao: { temp: "--", condition: "Loading...", humidity: "--", icon: <FaCloudSun /> },
    baguio: { temp: "--", condition: "Loading...", humidity: "--", icon: <FaCloudSun /> }
  });

  const [forexRates, setForexRates] = useState([
    { currency: "USD", country: "UNITED STATES", rate: "₱59.10" },
    { currency: "JPY", country: "JAPAN", rate: "₱0.38" },
    { currency: "GBP", country: "UNITED KINGDOM", rate: "₱79.11" },
    { currency: "SGD", country: "SINGAPORE", rate: "₱45.76" },
    { currency: "AUD", country: "AUSTRALIA", rate: "₱39.23" },
    { currency: "EUR", country: "EUROPEAN MONETARY UNION", rate: "₱69.38" }
  ]);

  const [showBarangayInfo, setShowBarangayInfo] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

 const scrollToSection = (sectionId) => {
  // Close mobile menu
  setMobileMenuOpen(false);
  
  // Check what type of navigation is needed
  if (sectionId === 'home' || sectionId === '') {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (sectionId.startsWith('/')) {
    // Navigate to another page
    navigate(sectionId);
  } else {
    // Try to scroll to section
    const sectionElement = document.getElementById(sectionId);
    
    if (sectionElement) {
      // Smooth scroll with offset for header
      const yOffset = -70; // Adjust based on your header height
      const y = sectionElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      // Fallback - scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};

  const handleReservation = () => {
    if (!selectedEquipment) {
      alert('Please select equipment first');
      return;
    }
    
    const reservationData = {
      equipment: selectedEquipment,
      date: selectedDate,
      time: 'Selected time slot'
    };
    
    alert(`Reservation successful!\nEquipment: ${selectedEquipment}\nDate: ${selectedDate}`);
    setSelectedEquipment("");
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const sectionRefs = {
    services: useRef(null),
    equipment: useRef(null),
    weather: useRef(null),
    ids: useRef(null),
    announcements: useRef(null)
  };

 // Sa LandingPage.jsx, sa line ~121, hanapin ang navItems array at palitan ng:
const navItems = [
  { label: "Home", path: "home", icon: <FaHome /> },
  { label: "Services", path: "#services", icon: <FaTools /> },
  { label: "Government IDs", path: "#government-ids", icon: <FaIdCard /> },
  { label: "Announcements", path: "#announcements", icon: <FaBell /> },
  { label: "Contact", path: "#contact", icon: <FaPhone /> },
  { label: "About Us", path: "/about-us", icon: <FaInfoCircle /> }, // ADD THIS
];

  const coreServices = [
  { 
    icon: <FaPrint />, 
    title: "Libreng Printing Services", 
    description: "Free document printing for residents, students, and job seekers. Maximum of 20 pages per month.",
    quota: "20 pages/month per resident",
    color: "#A43259",
    features: ["School Requirements", "Resume", "Personal Documents"],
    details: {
      eligibility: "All registered residents",
      hours: "8:00 AM - 5:00 PM",
      requirements: ["Barangay ID", "Valid reason for printing"]
    }
  },
  { 
    icon: <FaLaptop />, 
    title: "Computer & Internet Access", 
    description: "Free use of barangay computers for research, online applications, and learning.",
    quota: "2 hours/day per resident",
    color: "#F4BE2A",
    features: ["Computer Use", "School Purposes", "Printing Available"],
    details: {
      eligibility: "All registered residents",
      hours: "8:00 AM - 6:00 PM",
      requirements: ["Barangay ID", "Time slot reservation"]
    }
  },
  { 
    icon: <FaTools />, 
    title: "Equipment Borrowing", 
    description: "Reserve barangay equipment for community events, gatherings, and personal use.",
    quota: "Advance booking required (3 days)",
    color: "#2D9CDB", // Bagong kulay para sa ikatlong card
    features: ["Sound System", "Chairs & Tables", "Tents & Canopies", "Projectors"],
    details: {
      eligibility: "Registered residents & organizations",
      hours: "Available 24/7 with reservation",
      requirements: ["Valid ID", "Security deposit", "Event permit if applicable"]
    }
  }
];

  const equipmentList = [
    { id: 1, name: "Computer Set", icon: <FaDesktop />, quantity: 5, available: 3 },
    { id: 2, name: "Tent/Canopy", icon: <FaHome />, quantity: 5, available: 4 },
    { id: 3, name: "Chairs", icon: <FaChair />, quantity: 50, available: 40 },
    { id: 4, name: "Tables", icon: <FaClipboardList />, quantity: 20, available: 15 }
  ];

  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "1:00 PM - 3:00 PM",
    "3:00 PM - 5:00 PM",
    "5:00 PM - 7:00 PM"
  ];

  const governmentIDs = [
    {
      name: "Philippine Passport",
      agency: "Department of Foreign Affairs",
      icon: <FaPassport />,
      link: "https://www.passport.gov.ph/",
      requirements: ["PSA Birth Certificate", "Valid ID", "Marriage Certificate (if married)"],
      processingTime: "2-3 weeks"
    },
    {
      name: "Driver's License",
      agency: "LTO - Land Transportation Office",
      icon: <FaCar />,
      link: "https://www.lto.gov.ph/",
      requirements: ["Student Permit", "Medical Certificate", "Drug Test Result"],
      processingTime: "Same day to 1 week"
    },
    {
      name: "National ID (PhilSys)",
      agency: "Philippine Statistics Authority",
      icon: <FaIdCard />,
      link: "https://philsys.gov.ph/",
      requirements: ["PSA Birth Certificate", "Any valid supporting document"],
      processingTime: "4-6 weeks"
    },
    {
      name: "Postal ID",
      agency: "Philippine Postal Corporation",
      icon: <FaIdCard />,
      link: "https://www.phlpost.gov.ph/postal-id/",
      requirements: ["Birth Certificate", "Proof of Address", "Barangay Clearance"],
      processingTime: "10-15 working days"
    }
  ];

  const announcements = [
    {
      title: "Libreng Medical Check-up",
      date: "Dec 15-20, 2024",
      description: "Free medical check-up for senior citizens at barangay health center",
      category: "health"
    },
    {
      title: "Computer Training Workshop",
      date: "Dec 22, 2024",
      description: "Basic computer literacy training for senior citizens",
      category: "event"
    },
    {
      title: "Equipment Maintenance",
      date: "Dec 24-26, 2024",
      description: "Barangay equipment will be unavailable due to maintenance",
      category: "announcement"
    },
    {
      title: "New Year's Eve Celebration",
      date: "Dec 31, 2024",
      description: "Community New Year's celebration at barangay hall",
      category: "event"
    },
  ];


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
      
      Object.keys(sectionRefs).forEach(key => {
        if (sectionRefs[key].current) {
          const section = sectionRefs[key].current;
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const triggerPoint = windowHeight * 0.15;
          
          const isVisible = rect.top < windowHeight - triggerPoint && rect.bottom > triggerPoint;
          
          if (isVisible && !visibleSections[key]) {
            setVisibleSections(prev => ({ ...prev, [key]: true }));
            
            const animatedElements = section.querySelectorAll('[data-animate]');
            animatedElements.forEach((el, index) => {
              setTimeout(() => {
                el.setAttribute('data-animate', 'fade-in');
              }, index * 100);
            });
          }
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [scrolled, visibleSections]);

  useEffect(() => {
  const fetchWeatherData = async () => {
    try {
      const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
      
      if (!WEATHER_API_KEY || WEATHER_API_KEY === "96da4caf59c06a77f726665226175903") {
        setWeatherData({
          manila: { temp: 32, condition: "Sunny", humidity: 65, icon: <FaSun /> },
          cebu: { temp: 30, condition: "Partly Cloudy", humidity: 70, icon: <FaCloudSun /> },
          davao: { temp: 29, condition: "Cloudy", humidity: 75, icon: <FaCloud /> },
          baguio: { temp: 18, condition: "Cloudy", humidity: 80, icon: <FaCloud /> }
        });
        return;
      }
      
      const cities = [
        { name: "manila", lat: 14.5995, lon: 120.9842 },
        { name: "cebu", lat: 10.3157, lon: 123.8854 },
        { name: "davao", lat: 7.1907, lon: 125.4553 },
        { name: "baguio", lat: 16.4023, lon: 120.5960 }
      ];

      const weatherPromises = cities.map(city => 
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${WEATHER_API_KEY}&units=metric`
        ).then(response => {
          if (!response.ok) throw new Error('Weather API failed');
          return response.json();
        })
      );

      const results = await Promise.allSettled(weatherPromises);
      
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const city = cities[i];
          const data = result.value;
          
          const getWeatherIcon = (condition) => {
            const cond = condition.toLowerCase();
            if (cond.includes("clear")) return <FaSun />;
            if (cond.includes("cloud")) {
              if (cond.includes("few") || cond.includes("scattered")) return <FaCloudSun />;
              return <FaCloud />;
            }
            if (cond.includes("rain") || cond.includes("drizzle")) return <FaCloudRain />;
            if (cond.includes("thunder")) return <FaCloudRain />;
            return <FaCloudSun />;
          };
          
          setWeatherData(prev => ({
            ...prev,
            [city.name]: {
              temp: Math.round(data.main.temp),
              condition: data.weather[0].description,
              humidity: data.main.humidity,
              icon: getWeatherIcon(data.weather[0].main),
              wind: Math.round(data.wind.speed * 3.6)
            }
          }));
        }
      });
    } catch (error) {
    
      setWeatherData({
        manila: { temp: 32, condition: "Sunny", humidity: 65, icon: <FaSun /> },
        cebu: { temp: 30, condition: "Partly Cloudy", humidity: 70, icon: <FaCloudSun /> },
        davao: { temp: 29, condition: "Cloudy", humidity: 75, icon: <FaCloud /> },
        baguio: { temp: 18, condition: "Cloudy", humidity: 80, icon: <FaCloud /> }
      });
    }
  };

  const updateForexData = async () => {
    try {
      const FOREX_API_KEY = import.meta.env.VITE_FOREX_API_KEY || '664aca46e2d9189e3c45593c';
      
      // Try multiple forex API sources for reliability
      const apiUrls = [
        `https://api.exchangerate-api.com/v4/latest/PHP`,
        `https://v6.exchangerate-api.com/v6/${FOREX_API_KEY}/latest/PHP`
      ];
      
      let success = false;
      
      for (const apiUrl of apiUrls) {
        try {
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const data = await response.json();
            const rates = data.rates;
            
            // Format rates properly
            const forexData = [
              { currency: "USD", country: "UNITED STATES", rate: `₱${(1/rates.USD).toFixed(2)}` },
              { currency: "JPY", country: "JAPAN", rate: `₱${(1/rates.JPY).toFixed(2)}` },
              { currency: "GBP", country: "UNITED KINGDOM", rate: `₱${(1/rates.GBP).toFixed(2)}` },
              { currency: "SGD", country: "SINGAPORE", rate: `₱${(1/rates.SGD).toFixed(2)}` },
              { currency: "AUD", country: "AUSTRALIA", rate: `₱${(1/rates.AUD).toFixed(2)}` },
              { currency: "EUR", country: "EUROPEAN MONETARY UNION", rate: `₱${(1/rates.EUR).toFixed(2)}` }
            ];
            
            setForexRates(forexData);
            success = true;
            break;
          }
        } catch (apiError) {
          console.log(`Forex API attempt failed: ${apiUrl}`, apiError);
          continue;
        }
      }
      
      // If all API calls failed, use reliable mock data
      if (!success) {
        console.log("All forex APIs failed, using reliable mock data");
        const reliableRates = [
          { currency: "USD", country: "UNITED STATES", rate: "₱58.19" },
          { currency: "JPY", country: "JAPAN", rate: "₱0.38" },
          { currency: "GBP", country: "UNITED KINGDOM", rate: "₱78.73" },
          { currency: "SGD", country: "SINGAPORE", rate: "₱45.19" },
          { currency: "AUD", country: "AUSTRALIA", rate: "₱38.82" },
          { currency: "EUR", country: "EUROPEAN MONETARY UNION", rate: "₱68.04" }
        ];
        setForexRates(reliableRates);
      }
      
    } catch (error) {
      console.log("Forex API error, using reliable mock data:", error);
      const reliableRates = [
        { currency: "USD", country: "UNITED STATES", rate: "₱58.19" },
        { currency: "JPY", country: "JAPAN", rate: "₱0.38" },
        { currency: "GBP", country: "UNITED KINGDOM", rate: "₱78.73" },
        { currency: "SGD", country: "SINGAPORE", rate: "₱45.19" },
        { currency: "AUD", country: "AUSTRALIA", rate: "₱38.82" },
        { currency: "EUR", country: "EUROPEAN MONETARY UNION", rate: "₱68.04" }
      ];
      setForexRates(reliableRates);
    }
  };

  fetchWeatherData();
  updateForexData();
  
  const weatherInterval = setInterval(fetchWeatherData, 15 * 60 * 1000); // 15 minutes
  const forexInterval = setInterval(updateForexData, 60 * 60 * 1000); // 60 minutes
  
  return () => {
    clearInterval(weatherInterval);
    clearInterval(forexInterval);
  };
}, []);

// Update ang useEffect para sa better mobile experience
useEffect(() => {
  // Handle viewport height for mobile browsers
  const setVH = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Handle mobile keyboard visibility
  const handleResize = () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      document.body.classList.add('mobile-device');
    } else {
      document.body.classList.remove('mobile-device');
    }
    setVH();
  };

  // Prevent zoom on input focus for mobile
  const preventZoom = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1';
      }
    }
  };

  // Initial setup
  handleResize();

  // Event listeners
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  document.addEventListener('focusin', preventZoom);
  
  // Reset viewport on focus out
  document.addEventListener('focusout', () => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1';
    }
  });

  // Cleanup
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    document.removeEventListener('focusin', preventZoom);
    document.removeEventListener('focusout', () => {});
  };
}, []);

  return (
    <div className="landing-page">
      {/* HEADER */}
<header className={`header ${scrolled ? 'scrolled' : ''}`}>
  <div className="container">
    <div className="header-content">
      {/* LOGO */}
      <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
        
{navItems.map((item, index) => (
  <li key={index} className="nav-item">
    <a 
      href={item.path} 
      className="nav-link"
      onClick={(e) => {
        e.preventDefault();
        if (item.path.startsWith('/')) {
          navigate(item.path); // For external pages like /about-us
        } else {
          scrollToSection(item.path.replace('#', ''));
        }
      }}
    >
      {item.label}
    </a>
  </li>
))}
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
        if (item.path.startsWith('/')) {
          navigate(item.path);
        } else {
          scrollToSection(item.path.replace('#', ''));
        }
        toggleMobileMenu();
      }}
    >
      {item.label === "Home" && <FaHome />}
      {item.label === "Services" && <FaTools />}
      {item.label === "Government IDs" && <FaIdCard />}
      {item.label === "Announcements" && <FaBell />}
      {item.label === "Contact" && <FaPhone />}
      {item.label === "About Us" && <FaInfoCircle />} {/* ADD THIS */}
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



      {/* Hero Section with Barangay Photo */}
      <section className="hero-section">
        <div className="hero-background">
          {/* Add your Barangay photo here */}
          <img 
            src="/pic1.jpg"
            className="hero-image-bg"
          />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title fade-in" data-animate="fade-in">
                Welcome to <span className="hero-highlight">Barangay Sto. Domingo</span>
              </h1>
              <p className="hero-subtitle fade-in" data-animate="fade-in">
                <strong>Serbisyong Totoo, Pangarap ng Bawat Tao</strong><br/>
                Your community hub for digital services and government assistance
              </p>
              <div className="hero-buttons">
                <button 
                  className="btn-primary btn-large fade-in"
                  onClick={() => scrollToSection('services')}
                  data-animate="fade-in"
                >
                  Explore Services <FaArrowRight />
                </button>
                <button 
                  className="btn-secondary btn-large fade-in"
                  onClick={() => navigate("/register")}
                  data-animate="fade-in"
                >
                  Register Now
                </button>
              </div>
              <div className="hero-features">
                <div className="feature-badge float-element">
                  <FaPrint /> Free Printing
                </div>
                <div className="feature-badge float-element" style={{ animationDelay: '0.2s' }}>
                  <FaLaptop /> Computer Access
                </div>
                <div className="feature-badge float-element" style={{ animationDelay: '0.4s' }}>
                  <FaTools /> Equipment Borrowing
                </div>
               
              </div>
            </div>
          </div>
        </div>
      </section>

      

{/* Core Services Section - Updated Design */}
<section id="services" className="services-section" ref={sectionRefs.services}>
  <div className="container">
    <div className={`section-header ${visibleSections.services ? 'fade-in visible' : 'fade-in'}`}>
      <span className="section-tag">Our Services</span>
      <h2 className="section-title">Community Services</h2>
      <p className="section-subtitle">
        Access these essential services for free as a registered resident
      </p>
    </div>
    
    <div className="services-grid-new">
      {/* Equipment Borrowing Service */}
      <div 
        className="service-card-new" 
        role="article" 
        aria-label="Equipment borrowing service"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="service-card-inner">
          <div className="service-card-header">
            <div className="service-icon-wrapper">
              <div className="service-icon-bg" style={{ background: 'rgba(164, 50, 89, 0.1)', color: '#A43259' }}>
                <FaTools />
              </div>
              <h3 className="service-title-new">Equipment Borrowing</h3>
            </div>
          </div>
          
          <ul className="service-features-list">
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Sound System
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Chairs & Tables
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Tents & Canopies
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Projectors
              </a>
            </li>
          </ul>
          
          <div className="service-details-new">
            <div className="detail-item-new">
              <strong>Eligibility:</strong> Registered residents & organizations
            </div>
            <div className="detail-item-new">
              <strong>Service Hours:</strong> Available 24/7 with reservation
            </div>
            <div className="detail-item-new">
              <strong>Requirements:</strong> Valid ID, Security deposit
            </div>
          </div>
          
          <div className="service-quota-new">
            <FaRegClock /> Advance booking required (3 days)
          </div>
          
          <button 
            className="btn-view-all"
            onClick={() => scrollToSection('equipment-schedule')}
          >
            Reserve Equipment
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Computer & Internet Access Service */}
      <div 
        className="service-card-new" 
        role="article" 
        aria-label="Computer and internet service"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="service-card-inner">
          <div className="service-card-header">
            <div className="service-icon-wrapper">
              <div className="service-icon-bg" style={{ background: 'rgba(244, 190, 42, 0.1)', color: '#F4BE2A' }}>
                <FaLaptop />
              </div>
              <h3 className="service-title-new">Computer & Internet Access</h3>
            </div>
          </div>
          
          <ul className="service-features-list">
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Computer Use
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Internet Access
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                School Purposes
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Online Applications
              </a>
            </li>
          </ul>
          
          <div className="service-details-new">
            <div className="detail-item-new">
              <strong>Eligibility:</strong> All registered residents
            </div>
            <div className="detail-item-new">
              <strong>Service Hours:</strong> 8:00 AM - 6:00 PM (Daily)
            </div>
            <div className="detail-item-new">
              <strong>Requirements:</strong> Barangay ID, Time slot reservation
            </div>
          </div>
          
          <div className="service-quota-new">
            <FaRegClock /> 2 hours/day per resident
          </div>
          
          <button 
            className="btn-view-all"
            onClick={() => navigate("/login")}
          >
            Book Computer
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Free Printing Service */}
      <div 
        className="service-card-new" 
        role="article" 
        aria-label="Free printing service"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="service-card-inner">
          <div className="service-card-header">
            <div className="service-icon-wrapper">
              <div className="service-icon-bg" style={{ background: 'rgba(45, 156, 219, 0.1)', color: '#2D9CDB' }}>
                <FaPrint />
              </div>
              <h3 className="service-title-new">Libreng Printing Services</h3>
            </div>
          </div>
          
          <ul className="service-features-list">
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                School Requirements
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Resume/CV
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Personal Documents
              </a>
            </li>
            <li>
              <a className="service-feature-link" href="#">
                <span className="feature-dot"></span>
                Government Forms
              </a>
            </li>
          </ul>
          
          <div className="service-details-new">
            <div className="detail-item-new">
              <strong>Eligibility:</strong> All registered residents
            </div>
            <div className="detail-item-new">
              <strong>Service Hours:</strong> 8:00 AM - 5:00 PM (Mon-Sat)
            </div>
            <div className="detail-item-new">
              <strong>Requirements:</strong> Barangay ID, Valid reason for printing
            </div>
          </div>
          
          <div className="service-quota-new">
            <FaRegClock /> 20 pages/month per resident
          </div>
          
          <button 
            className="btn-view-all"
            onClick={() => navigate("/login")}
          >
            Print Documents
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Free Printing Instructions Section */}
<section id="printing-instructions" className="instructions-section">
  <div className="container">
    <div className="section-header">
      <span className="section-tag">Online Service</span>
      <h2 className="section-title">Request for Libreng Print</h2>
      <p className="section-subtitle">
        Follow these simple steps:
      </p>
    </div>
    
    <div className="instructions-container">
      <div className="steps-grid">
        {/* Step 1 - Registration with Proof */}
        <div className="step-card">
          <div className="step-number">
            <span>1</span>
          </div>
          <div className="step-image">
            <img 
              src="/p1.jgpg" 
              alt="Register Online"
              onError={(e) => {
                e.target.src = "/p1.jpg";
              }}
            />
          </div>
          <div className="step-content">
            <h3>Register Online with Proof of Residency</h3>
            <p>Create your account by providing your personal information and uploading a proof that you are a resident of Barangay Sto. Domingo.</p>
            <div className="step-requirements">
              <strong>What you need to do:</strong>
              <ul>
                <li>Fill out registration form with complete information</li>
                <li>Upload a clear photo as proof of residency</li>
                <li>Wait for email confirmation (24-48 hours)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 2 - Email Confirmation */}
        <div className="step-card">
          <div className="step-number">
            <span>2</span>
          </div>
          <div className="step-image">
            <img 
              src="/step2.jpg" 
              alt="Email Confirmation"
              onError={(e) => {
                e.target.src = "step2.png";
              }}
            />
          </div>
          <div className="step-content">
            <h3>Wait for Email Confirmation</h3>
            <p>After registration, check your email for the confirmation message. Your account will be activated once verified by barangay staff.</p>
            <div className="step-requirements">
              <strong>Email Details:</strong>
              <ul>
                <li>Check your inbox and spam folder</li>
                <li>Click the confirmation link if provided</li>
                <li>Login credentials will be sent upon approval</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 3 - Access Dashboard */}
        <div className="step-card">
          <div className="step-number">
            <span>3</span>
          </div>
          <div className="step-image">
            <img 
              src="/p2.jpg" 
              alt="Access Dashboard"
              onError={(e) => {
                e.target.src = "/p2.jpg";
              }}
            />
          </div>
          <div className="step-content">
            <h3>Login and Access Your Dashboard</h3>
            <p>Once your account is activated, login to access your personalized dashboard where you can manage your printing requests.</p>
            <div className="step-requirements">
              <strong>Dashboard Features:</strong>
              <ul>
                <li>View remaining printing quota</li>
                <li>Track request status</li>
                <li>Check printing history</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 4 - Submit Print Request */}
        <div className="step-card">
          <div className="step-number">
            <span>4</span>
          </div>
          <div className="step-image">
            <img 
              src="/p3.jpg" 
              alt="Submit Print Request"
              onError={(e) => {
                e.target.src = "/p3.jpg";
              }}
            />
          </div>
          <div className="step-content">
            <h3>Submit Your Printing Request</h3>
            <p>Click "Print Request" or "Request Free Print" on your dashboard, upload your file, and select your preferred schedule.</p>
            <div className="step-requirements">
              <strong>Request Details:</strong>
              <ul>
                <li>Upload file (PDF, DOC, JPG, etc.)</li>
                <li>Select print schedule/urgency</li>
                <li>Specify number of copies</li>
                <li>Check available quota</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 5 - Track Status */}
        <div className="step-card">
          <div className="step-number">
            <span>5</span>
          </div>
          <div className="step-image">
            <img 
              src="/p4.jpg" 
              alt="Track Request Status"
              onError={(e) => {
                e.target.src = "/p4.jpg";
              }}
            />
          </div>
          <div className="step-content">
            <h3>Track Your Request Status</h3>
            <p>Monitor the status of your request: Pending → Accepted → Printing → Ready for Pickup. You'll receive email updates at each stage.</p>
            <div className="step-requirements">
              <strong>Status Updates:</strong>
              <ul>
                <li><strong>Pending</strong>: Waiting for staff approval</li>
                <li><strong>Accepted</strong>: Request approved, in queue</li>
                <li><strong>Printing</strong>: Currently being printed</li>
                <li><strong>Ready for Pickup</strong>: Can be claimed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 6 - Pickup Printed Documents */}
        <div className="step-card">
          <div className="step-number">
            <span>6</span>
          </div>
          <div className="step-image">
            <img 
              src="/p5.jpg" 
              alt="Pickup Documents"
              onError={(e) => {
                e.target.src = "/p5.jpg";
              }}
            />
          </div>
          <div className="step-content">
            <h3>Pick Up Your Printed Documents</h3>
            <p>Once status shows "Ready for Pickup", visit the Barangay Hall during office hours to claim your printed documents.</p>
            <div className="step-requirements">
              <strong>Pickup Requirements:</strong>
              <ul>
                <li>Bring valid ID for verification</li>
                <li>Check pickup schedule in your request</li>
                <li>Sign upon receipt of documents</li>
                <li>Pick up within 3 days after ready status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="printing-rules">
        <div className="rules-card">
          <h3><FaExclamationCircle /> System Features & Reminders</h3>
          <div className="rules-list">
            <div className="rule-item">
              <FaCheckCircle /> <span>Real-time tracking of your print request status</span>
            </div>
            <div className="rule-item">
              <FaCheckCircle /> <span>Automatic email notifications at every stage</span>
            </div>
            <div className="rule-item">
              <FaCheckCircle /> <span>Dashboard shows remaining monthly quota</span>
            </div>
            <div className="rule-item">
              <FaCheckCircle /> <span>Schedule your pickup based on availability</span>
            </div>
            <div className="rule-item">
              <FaCheckCircle /> <span>Upload multiple file formats (PDF, DOC, JPG, PNG, PPT)</span>
            </div>
            <div className="rule-item">
              <FaCheckCircle /> <span>View complete printing history in your dashboard</span>
            </div>
          </div>
          
          <div className="printing-limits">
            <h4><FaPrint /> Monthly Printing Quota (Per Resident)</h4>
            <div className="limits-grid">
              <div className="limit-item">
                <div className="limit-type">Total Pages (Max)</div>
                <div className="limit-pages">20 pages</div>
              </div>
              <div className="limit-item">
                <div className="limit-type">Black & White</div>
                <div className="limit-pages">Included</div>
              </div>
              <div className="limit-item">
                <div className="limit-type">Color Printing</div>
                <div className="limit-pages">5 pages max</div>
              </div>
              <div className="limit-item">
                <div className="limit-type">Reset Date</div>
                <div className="limit-pages">1st of Month</div>
              </div>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate("/register")}
            >
              <FaUserPlus /> Register Now
            </button>
            <button 
              className="btn-secondary"
              onClick={() => {
                // Check if user is logged in
                const token = localStorage.getItem('authToken');
                if (token) {
                  navigate("/dashboard");
                } else {
                  navigate("/login");
                }
              }}
            >
              <FaPrint /> Request Printing
            </button>
            <button 
              className="btn-outline"
              onClick={() => navigate("/login")}
            >
              <FaSignInAlt /> Login to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      

     {/* Combined Weather, Forex & Emergency Section */}
<section id="combined-info" className="combined-info-section">
  <div className="container">
    <div className="section-header">
      <span className="section-tag">Real-Time Information</span>
      <h2 className="section-title">Community Updates</h2>
      <p className="section-subtitle">
        Stay informed with weather updates, exchange rates, and emergency hotlines
      </p>
    </div>

    <div className="combined-grid">
      {/* Weather Card */}
      <div className="info-card weather-card">
        <div className="info-card-header">
          <FaCloudSun className="info-card-icon" />
          <h3>Weather Updates</h3>
        </div>
        
        <div className="weather-cities-grid">
          {['manila', 'cebu', 'davao', 'baguio'].map((city) => {
            const cityData = weatherData[city] || {};
            return (
              <div key={city} className="weather-city-card">
                <div className="weather-city-icon">
                  {cityData.icon || <FaCloudSun />}
                </div>
                <div className="weather-city-info">
                  <h4 className="weather-city-name">{city.toUpperCase()}</h4>
                  <p className="weather-city-temp">{cityData.temp || '--'}°C</p>
                  <p className="weather-city-condition">
                    {(cityData.condition || 'Loading...').split(' ')[0]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="info-card-footer">
          <p className="weather-source">Data from OpenWeather</p>
          <a 
            href="https://openweathermap.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="view-details-link"
          >
            Detailed Forecast <FaArrowRight />
          </a>
        </div>
      </div>

      {/* Forex Card */}
      <div className="info-card forex-card">
        <div className="info-card-header">
          <FaChartLine className="info-card-icon" />
          <h3>Exchange Rates</h3>
        </div>
        
        <div className="forex-table">
          <div className="forex-table-header">
            <span>Currency</span>
            <span>₱ Rate</span>
          </div>
          <div className="forex-table-body">
            {forexRates.slice(0, 5).map((currency, index) => (
              <div key={index} className="forex-row">
                <div className="forex-currency">
                  <span className="currency-code">{currency.currency}</span>
                  <span className="currency-country">{currency.country}</span>
                </div>
                <div className="forex-rate">
                  {currency.rate}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="info-card-footer">
          <span className="last-updated">Updated daily</span>
          <a 
            href="https://www.bsp.gov.ph/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="view-details-link"
          >
            More Currencies <FaArrowRight />
          </a>
        </div>
      </div>

      {/* Emergency Card */}
      <div className="info-card emergency-card">
        <div className="info-card-header emergency-header">
          <FaExclamationCircle className="info-card-icon" />
          <h3>Emergency Hotlines</h3>
        </div>
        
        <div className="hotlines-grid">
          <div className="hotline-item">
            <span className="hotline-name">National Emergency</span>
            <a href="tel:911" className="hotline-number">911</a>
          </div>
          <div className="hotline-item">
            <span className="hotline-name">PNP Emergency</span>
            <a href="tel:117" className="hotline-number">117</a>
          </div>
          <div className="hotline-item">
            <span className="hotline-name">Red Cross</span>
            <a href="tel:143" className="hotline-number">143</a>
          </div>
          <div className="hotline-item">
            <span className="hotline-name">Barangay Hall</span>
            <a href="tel:0229251234" className="hotline-number">(02) 8925-1234</a>
          </div>
        </div>
        
        <div className="hotline-note">
          <FaExclamationTriangle /> For mental health support: 0917-899-8727
        </div>
        
        <div className="info-card-footer">
          <a 
            href="https://www.dilg.gov.ph/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="view-all-link"
          >
            View all hotlines <FaArrowRight />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

       

    

      {/* Government IDs Section */}
      <section id="government-ids" className="ids-section" ref={sectionRefs.ids}>
        <div className="container">
          <div className={`section-header ${visibleSections.ids ? 'fade-in visible' : 'fade-in'}`}>
            <span className="section-tag">Government Services</span>
            <h2 className="section-title">Apply for Government IDs</h2>
            <p className="section-subtitle">
              Direct links to official government websites for ID applications
            </p>
          </div>
          
          <div className="ids-grid">
            {governmentIDs.map((id, index) => (
              <div 
                key={index} 
                className={`id-card ${visibleSections.ids ? 'visible' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  transitionDelay: `${index * 0.1}s`
                }}
              >
                <div className="id-icon">{id.icon}</div>
                <div className="id-content">
                  <h3>{id.name}</h3>
                  <p className="id-agency">{id.agency}</p>
                  <div className="id-details">
                    <div className="id-detail">
                      <strong>Processing Time:</strong> {id.processingTime}
                    </div>
                    <div className="id-requirements">
                      <strong>Requirements:</strong>
                      <ul>
                        {id.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <a 
                    href={id.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-id-apply"
                  >
                    Apply Online <FaArrowRight />
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`ids-note ${visibleSections.ids ? 'fade-in visible' : 'fade-in'}`}>
            <FaExclamationTriangle /> Note: These are links to official government websites.
            Barangay Sto. Domingo provides assistance in processing these documents.
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section id="announcements" className="announcements-section" ref={sectionRefs.announcements}>
        <div className="container">
          <div className={`section-header ${visibleSections.announcements ? 'fade-in visible' : 'fade-in'}`}>
            <span className="section-tag">Latest Updates</span>
            <h2 className="section-title">Mga Anunsyo at Paalala</h2>
            <p className="section-subtitle">
              Stay updated with the latest barangay news and events
            </p>
          </div>
          
          <div className="announcements-grid">
            {announcements.map((announcement, index) => (
              <div 
                key={index} 
                className={`announcement-card ${visibleSections.announcements ? 'visible' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  transitionDelay: `${index * 0.1}s`
                }}
              >
                <div className="announcement-header">
                  <span className={`announcement-category ${announcement.category}`}>
                    {announcement.category.toUpperCase()}
                  </span>
                  <span className="announcement-date">
                    <FaCalendarAlt /> {announcement.date}
                  </span>
                </div>
                <h3 className="announcement-title">{announcement.title}</h3>
                <p className="announcement-description">{announcement.description}</p>
                <button className="btn-announcement-more">
                  Read More <FaArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barangay Info Modal */}
{showBarangayInfo && (
  <div className="barangay-modal-overlay" onClick={() => setShowBarangayInfo(false)}>
    <div className="barangay-modal" onClick={(e) => e.stopPropagation()}>
      {/* PALITAN ANG HEADER */}
      <div className="modal-header">
        <h2>Barangay Profile</h2>
        <button className="modal-close" onClick={() => setShowBarangayInfo(false)}>
          <FaTimes />
        </button>
      </div>
      
      <div className="modal-content">
        {/* PALITAN ANG HERO SECTION */}
        <div className="barangay-hero">
          <h3>About Barangay Sto. Domingo</h3>
          <p className="barangay-slogan">"Serbisyong Totoo, Pangarap ng Bawat Tao"</p>
        </div>
        
        {/* PALITAN ANG ABOUT SECTION */}
        <div className="barangay-section">
          <h4>About Our Barangay</h4>
          <p>Barangay Sto. Domingo is a vibrant community located in Quezon City, dedicated to serving our residents with quality public services. Established in 1965, we have grown into a progressive barangay that values community development and public welfare.</p>
          
          <p>Our mission is to provide accessible services to all residents while fostering a safe, clean, and united community. We offer various programs including free printing services, computer access, equipment borrowing, and assistance in government ID processing.</p>
        </div>
        
        <div className="barangay-stats">
          <div className="stat">
            <h5>Population</h5>
            <p>25,000+ Residents</p>
          </div>
          <div className="stat">
            <h5>Area</h5>
            <p>35 Hectares</p>
          </div>
          <div className="stat">
            <h5>Established</h5>
            <p>1965</p>
          </div>
        </div>
        
        {/* KEEP THE REST OF THE CONTENT */}
        <div className="barangay-section">
          <h4>Barangay Officials</h4>
          <div className="officials-list">
            <div className="official">
              <strong>Punong Barangay:</strong> Hon. Juan Dela Cruz
            </div>
            <div className="official">
              <strong>Barangay Secretary:</strong> Ms. Maria Santos
            </div>
            <div className="official">
              <strong>Barangay Treasurer:</strong> Mr. Roberto Lim
            </div>
            <div className="official">
              <strong>SK Chairman:</strong> Hon. Miguel Gomez
            </div>
          </div>
        </div>
        
        <div className="barangay-section">
          <h4>Our Facilities</h4>
          <ul className="facilities-list">
            <li><FaCheckCircle /> Barangay Hall with Free Wi-Fi</li>
            <li><FaCheckCircle /> Health Center</li>
            <li><FaCheckCircle /> Multi-Purpose Hall</li>
            <li><FaCheckCircle /> Basketball Court</li>
            <li><FaCheckCircle /> Children's Playground</li>
            <li><FaCheckCircle /> Senior Citizen's Lounge</li>
          </ul>
        </div>
        
        <div className="barangay-contact">
          <h4>Contact Us</h4>
          <p><FaMapMarkerAlt /> Sto. Domingo Avenue, Quezon City</p>
          <p><FaPhone /> (02) 8925-1234</p>
          <p><FaEnvelope /> sksto.domingoqc@gmail.com</p>
          <p><FaClock /> Monday-Saturday: 8:00 AM - 5:00 PM</p>
        </div>
      </div>
      
      <div className="modal-footer">
        <button 
          className="btn-primary"
          onClick={() => navigate("/login")}
        >
          Access Barangay Services
        </button>
      </div>
    </div>
  </div>
)}

      {/* Footer */}
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
                <p><FaWifi /> Free Wi-Fi: 8AM-8PM Daily</p>
              </div>
              <div className="office-hours">
                <h4>Service Hours</h4>
                <p>Computer Borrowing: 8AM - 5PM (Mon-Sat)</p>
                <p>Printing Services: 8AM - 6PM (Daily)</p>
                <p>Equipment Borrowing: 8AM - 5PM (Mon-Fri)</p>
              </div>
            </div>

            <div className="footer-section">
              <h3>Quick Services</h3>
              <ul className="footer-links">
                <li>
                  <a 
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('services');
                    }}
                  >
                    <FaPrint /> Printing Services
                  </a>
                </li>
                <li>
                  <a 
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('services');
                    }}
                  >
                    <FaLaptop /> Computer & Internet
                  </a>
                </li>
                <li>
                  <a 
                    href="#equipment-schedule"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('equipment-schedule');
                    }}
                  >
                    <FaTools /> Equipment Borrowing
                  </a>
                </li>
                <li>
                  <a 
                    href="#government-ids"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('government-ids');
                    }}
                  >
                    <FaIdCard /> Government IDs
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li>
                  <a 
                    href="#announcements"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('announcements');
                    }}
                  >
                    <FaBell /> Announcements
                  </a>
                </li>
                <li>
                  <a 
                    href="#weather"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('weather');
                    }}
                  >
                    <FaCloudSun /> Weather
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }}
                  >
                    <FaPhone /> Contact Us
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
              </ul>
            </div>

            <div className="footer-section">
              <h3>Connect With Us</h3>
              <div className="social-icons">
                <a href="https://web.facebook.com/profile.php?id=61553382433995&mibextid=wwXIfr&rdid=fnCLVh0jMSM29hiD&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F16tNxmsY51%2F%3Fmibextid%3DwwXIfr%26_rdc%3D1%26_rdr#" target="https://web.facebook.com/profile.php?id=61553382433995&mibextid=wwXIfr&rdid=fnCLVh0jMSM29hiD&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F16tNxmsY51%2F%3Fmibextid%3DwwXIfr%26_rdc%3D1%26_rdr#" rel="https://web.facebook.com/profile.php?id=61553382433995&mibextid=wwXIfr&rdid=fnCLVh0jMSM29hiD&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F16tNxmsY51%2F%3Fmibextid%3DwwXIfr%26_rdc%3D1%26_rdr#">
                  <FaFacebook />
                </a>
              </div>
              
              <div className="emergency-contact">
                <h4>Emergency Contacts</h4>
                <p>Barangay Hall: (123) 456-789</p>
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

export default LandingPage;