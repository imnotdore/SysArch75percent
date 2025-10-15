import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle,
  FaClipboardList,
  FaConciergeBell,
  FaFileAlt,
  FaSignOutAlt,
  FaCalendarAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from 'react-icons/fa';

export default function ResidentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [username, setUsername] = useState("");

// kapag nag-mount, kunin yung username
useEffect(() => {
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    setUsername(storedUsername);
  }
}, []);




  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const announcements = [
    {
      id: 1,
      title: 'Barangay Basketball League',
      content:
        'The Barangay Basketball Tournament will start on August 25 at the covered court.',
        
    },
    {
      id: 2,
      title: 'Free Vaccination Program',
      content:
        'Residents may avail free flu vaccines at the Barangay Health Center on September 3.',
    },
     {
      id: 3,
      title: 'Matchmaking',
      content:
        'Barangay Uno Vs Barangay Dos. arrive at court 30mins before the game or will be default',
    },
  ];

  const projectVideoUrl =
    'https://media.istockphoto.com/id/2191922460/video/mountainous-horizon-in-lipa-city-batangas.mp4?s=mp4-640x640-is&k=20&c=r1kao0Cgr_BE6vEOqm0z2y_R2joO1xjNm00qD4_lUO0=';

  const sidePictures = [
    'https://scontent.fmnl17-3.fna.fbcdn.net/v/t1.15752-9/550698908_773205295619514_8422588768104079046_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGQk4OPjdkC4xNLVQBR-yb_WMkkOa_kQJNYySQ5r-RAkxpWV9iUMyBEJmMw_ETX2u3r3TueZokfhuoX_p7CMKcH&_nc_ohc=-WiuStroLoYQ7kNvwFw0doi&_nc_oc=Adm-k3g5v65sLmRNucVuxlgDECu3_X97iC4NvhThJi6fUjRVab4J9l4q0UiXjhow1Sk&_nc_zt=23&_nc_ht=scontent.fmnl17-3.fna&oh=03_Q7cD3QG5i4FvopphREY0EN4gjB1GaXzlSJ-tKYgrFMjmumcd8g&oe=68F5F847',
    'https://scontent.fmnl17-1.fna.fbcdn.net/v/t1.15752-9/525731388_1250045176610704_741930549309933683_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeEWJ-_-B7Dz-mozz5vUwygyPchZTn38wPE9yFlOffzA8VFglJLqxXmvH5OPeLIdMxZmEMwOeFtj-NCH9iXtXUzb&_nc_ohc=8dZq1ESU4U8Q7kNvwHYN0ra&_nc_oc=Adla1PMVm8SYcxxa2dlFY_HgbmM3yX9QXxqC_p3v8_SD59gXvtFhS2lpLoY1r2aAI0w&_nc_zt=23&_nc_ht=scontent.fmnl17-1.fna&oh=03_Q7cD3QGTji5e1f17D-pKsXym2CXaT0mHhpRyatEVWCqUpjCc4A&oe=68F5EDB1',
    'https://scontent.fmnl17-3.fna.fbcdn.net/v/t1.15752-9/551037623_798617752618629_8395003703547952576_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFi6NSuinikBFjqLfKhVFQc2_gCXlitZKbb-AJeWK1kpnp7QgZng3_00nEn2Zsa-G0vimWL_FINSaZeYIC9-cAL&_nc_ohc=J0rhGX8qMkkQ7kNvwG_RPBT&_nc_oc=AdkcXUw41DpHkp99loANkjqzGD0zu4jxocbrWFMLkLYQUv0PrLCevacpbjDmnp1Z4eY&_nc_zt=23&_nc_ht=scontent.fmnl17-3.fna&oh=03_Q7cD3QEQDDkR5Wj7gR4_kitNgw4WrnFaXcn7zQ0NiXxJpNJKxw&oe=68F60AE5',
  ];

  const galleryProjects = [
  {
    id: 1,
    
    img: 'https://scontent.fmnl17-2.fna.fbcdn.net/v/t1.15752-9/551026159_1449700266258318_6495996553970093664_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHFVB39C49rMbCCGErDfng9lSZd0s6x8J-VJl3SzrHwnw-QYxqMe0pGP3H5-_uRJEIapZqeNm92CBu9FfZvRtHl&_nc_ohc=jRXc4IEiuJQQ7kNvwFW_fbK&_nc_oc=AdkUBYGVXD2N0yVBVLqZkEFpAEPcCDWTFBIJLXhkJ7fQj92bWtUDZX9GlRYKPB9bqFo&_nc_zt=23&_nc_ht=scontent.fmnl17-2.fna&oh=03_Q7cD3QHCdH4_2msAwKs_naLBZBijbCEVFSVWn_vEFfgzuh5YRQ&oe=68F5E81A',
    name: 'Sto. Domingo Achievers',
    details: 'Sto. Domingo Achievers',
    date: 'August 15, 2025',
  },
  {
    id: 2,
    img: 'https://scontent.fmnl17-6.fna.fbcdn.net/v/t1.15752-9/550886418_758848446991012_650605514233873867_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFl8WDbsR-Dt1B-KJwquEhFlWKmjwd68g6VYqaPB3ryDlunjVaDzz-GtScX8cZopDIkXJPkegVg_HIYbWAjcAVR&_nc_ohc=PcTUVUPiVt4Q7kNvwE7Wbrh&_nc_oc=AdnwCotwboMLDNKyv5IkAPSIFgxq9p7WiXWGFakfZg0HCybsfls6nKM6kC9JbQGD6Q8&_nc_zt=23&_nc_ht=scontent.fmnl17-6.fna&oh=03_Q7cD3QEzkgtqutByMoBZqMMCjats0Wi1bMQKTqvUZS6SoDMTfw&oe=68F5F8AA',
    name: 'Palarong Lahi',
    details: 'Palarong Lahi',
    date: 'July 20, 2025',
  },
  {
    id: 3,
    img: 'https://scontent.fmnl17-5.fna.fbcdn.net/v/t1.15752-9/551500164_758904716912566_1284618875333881861_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeH52z5q8n4N4VF-uKjy2BKbRC7k5oSu7SBELuTmhK7tIJJvohlv251Tu_znWou9QfN7q94zlsJWBzlIGcQu15Sv&_nc_ohc=Ag0EYMwDunUQ7kNvwFCfoxo&_nc_oc=AdkGX2NhQIlzLn9DPfmQnxHiVf0qU_wj0JcEAs8KquBEzjHN3azofBtiPjaqPhduwE8&_nc_zt=23&_nc_ht=scontent.fmnl17-5.fna&oh=03_Q7cD3QHrudolb2G31sO9eWfgHiLS_0Aksdj-zbBL3qtBUPwOOQ&oe=68F5D3D4',
    name: 'KK Night',
    details: 'KK Night',
    date: 'June 10, 2025',
  },
  {
    id: 4,
    img: 'https://scontent.fmnl17-3.fna.fbcdn.net/v/t1.15752-9/548876698_989859433252712_5875665853928020794_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeHlSxTs8BU1PbfO3LWLe7-h_SCECuuWj9j9IIQK65aP2FiGU_6shOMUnuPKax1J1kH5mspxxh4Iga3SfIDHX5xe&_nc_ohc=5R0AGiUailoQ7kNvwGhMe5g&_nc_oc=Adncz83Y5wZNTclkiGrsQzXgXE3diZGznJ00n_XlvSLK3YKBxHSIe_f9sDkTiCEu1JQ&_nc_zt=23&_nc_ht=scontent.fmnl17-3.fna&oh=03_Q7cD3QEM4YwpQD-8BmsdjnHeOsnKFrcvOMPlfVkN7kkb_XdJlQ&oe=68F5E91F',
    name: 'Basketball Try out',
    details: 'Basketball Try out',
    date: 'May 5, 2025',
  },
];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div
      style={{
        fontFamily: '"Lexend", sans-serif',
        width: '100%',
        overflowX: 'hidden',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
     <header
  style={{
    backgroundColor: '#F4BE2A',
    color: 'black',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 999,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  }}
>
  {/* Hamburger sa kaliwa para sa mobile */}
  {isMobile && (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      style={{
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: 'black',
        marginRight: '10px', // konting space sa pagitan ng text
      }}
    >
      ☰
    </button>
  )}

 {/* Barangay Logo + Username */}
<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <img
    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuTWGBGqTAFV1r0LROEwfjVxsqs36wmWQqkQ&s"
    alt="Sk Logo"
    style={{
      width: '50px',
      height: '50px',
      borderRadius: '5px',
    }}
  />
  {username && (
    <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'black' }}>
      Welcome, {username}!
    </span>
  )}
</div>



  <h1
  style={{
    margin: 0,
    textAlign: 'center',
    flex: 1,
    fontSize: isMobile ? '15px' : 'clamp(18px, 2vw, 28px)', // 15px sa mobile, responsive sa desktop
    fontWeight: 'bold',
  }}
>
  Mabuhay Katipunan ng Kabataan!
</h1>


  {/* Puwedeng alisin yung empty space sa kanan */}
  <div style={{ width: '34px' }} /> {/* placeholder para balance */}
</header>


      <div style={{ display: 'flex', position: 'relative' }}>
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          style={{
            position: isMobile ? 'fixed' : 'relative',
            top: 0,
            left: sidebarOpen || !isMobile ? 0 : '-240px',
            height: '200vh',
            width: '220px',
            backgroundColor: '#A43259',
            color: 'white',
            transition: 'left 0.3s ease',
            zIndex: 1000,
            padding: '20px 10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
 
       {/* Your Account */}
<div
  style={{
    textAlign: "center",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#f9f9f9ff",
    borderRadius: "8px",
    color: "black",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
  onClick={() => navigate("/resident/youraccount")}
>
  <FaUserCircle size={50} color="black" />

  {/* Username instead of "Your Account" */}
  {username ? (
    <p style={{ fontWeight: "bold", marginTop: "10px" }}>Your Account</p>
  ) : (
    <p style={{ fontWeight: "bold", marginTop: "10px" }}></p>
  )}
</div>





{/* Disclosure Board */}
<div
  style={{
    ...menuStyle,
    backgroundColor: '#1E90FF', // Blue permanent
    color: 'white',
    transition: 'transform 0.2s ease', // smooth slide
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateX(10px)'; // slide right
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateX(0)'; // balik normal
  }}
  onClick={() => navigate('/resident/disclosure-board')}
>
  <FaClipboardList style={iconStyle} /> Disclosure Board
</div>

{/* Services */}
<div>
  <div
    style={{
      ...menuStyle,
      backgroundColor: '#F4BE2A', // Yellow permanent
      color: 'black',
      transition: 'transform 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateX(10px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateX(0)';
    }}
    onClick={() => setServicesOpen(!servicesOpen)}
  >
    <FaConciergeBell style={iconStyle} /> Services
  </div>
  {servicesOpen && (
    <div
      style={{
        marginLeft: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        marginTop: '5px',
      }}
    ><div
  style={{
    ...submenuStyle,
    backgroundColor: '#1E90FF', 
    color: 'white',
    transition: 'transform 0.3s ease',
  }}
  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(10px)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
  onClick={() => navigate('/resident/computer-borrowing')}
>
  <FaClipboardList style={iconStyle} /> Computer Borrowing
</div>

      <div
        style={{
          ...submenuStyle,
          backgroundColor: '#1E90FF', // Blue permanent
          color: 'white',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(10px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
        }}
        onClick={() => navigate('/resident/request')}
      >
        <FaFileAlt style={iconStyle} /> Requests
      </div>
      <div
        style={{
          ...submenuStyle,
          backgroundColor: '#1E90FF',
          color: 'white',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(10px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
        }}
        onClick={() => navigate('/resident/schedule')}
      >
        <FaCalendarAlt style={iconStyle} /> Schedule
      </div>
    </div>
  )}
</div>


          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button
              onClick={handleLogout}
              style={{
                ...menuStyle,
                backgroundColor: '#ff0000',
                color: 'white',
                width: '100%',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              <FaSignOutAlt style={iconStyle} /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? '15px 10px' : '20px',
            overflowY: 'auto',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Announcements */}
            <section
              style={{
                backgroundColor: 'rgba(0, 255, 0, 0.31)',
                borderRadius: '10px',
                padding: '20px',
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow: '0 0 5px #999',
              }}
            >

              
              <h2>ANNOUNCEMENTS</h2>
              {announcements.map((a) => (
                <div key={a.id} style={{ marginBottom: '10px' }}>
                  <h3>{a.title}</h3>
                  <p>{a.content}</p>
                </div>
              ))}
            </section>

            {/* Video + Pictures */}
            <section
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '50px',
                marginTop: '20px',
                alignItems: 'flex-start',
              }}
            >
              {/* Video */}
              <div
                style={{
                  flex: 1,
                  border: '3px solid black',
                  borderRadius: '12px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                  backgroundColor: '#F4BE2A',
                  minHeight: isMobile ? '200px' : '300px',
                }}
              >
                <video
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                >
                  <source src={projectVideoUrl} type="video/mp4" />
                </video>
                <p
                  style={{ textAlign: 'center', marginTop: '10px', fontWeight: '1000' }}
                >
                  Current Projects Video
                </p>
              </div>

              {/* Pictures */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  gap: '5px',
                  width: isMobile ? '100%' : '200px',
                  alignItems: 'center',
                }}
              >
                {sidePictures.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Pic ${idx + 1}`}
                    style={{
                      width: isMobile ? '100px' : '150px',
                      height: 'auto',
                      borderRadius: '12px',
                      border: '3px solid black',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                    }}
                  />
                ))}
              </div>
            </section>

          {/* Gallery */}
<section style={{ marginTop: '20px' }}>
  <div style={{ marginBottom: '15px' }}>
   <h2
  style={{
    color: '#000000',
    fontFamily: 'Oswald, Arial',
    fontVariant: 'normal',
    fontWeight: 700,
    verticalAlign: 'baseline',
    textAlign: 'left',
    marginLeft: isMobile ? '5%' : '7%',
    fontSize: '25px',
    letterSpacing: '1px',
    margin: 5,
    paddingBottom: '20px',
  }}
>
  RECENT PROJECTS
</h2>

    {/* Separator line */}
    <div
       style={{
    width: '86%',
    height: '9px',
    background: 'linear-gradient(90deg, #28D69F, #3ED9A2)', // gradient effect
    margin: 'auto',
    borderRadius: '100px',
    border: '1px solid #1F9A78', // subtle border
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)', // soft shadow for depth
  }}
    />
  </div>

  {/* Project cards */}
  <div
  style={{
    display: 'flex',
    gap: '20px',
    flexWrap: isMobile ? 'nowrap' : 'wrap', // no wrap sa mobile
    overflowX: isMobile ? 'auto' : 'visible', // horizontal scroll sa mobile
    paddingBottom: '10px',
    justifyContent: isMobile ? 'flex-start' : 'center',
    scrollBehavior: 'smooth', // smooth scroll
    WebkitOverflowScrolling: 'touch', // smooth scrolling for iOS
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE 10+
  }}
  className="horizontal-scroll"
>







  {galleryProjects.map((p) => (
  <div
    key={p.id}
    style={{
      flex: '0 0 auto',
      width: isMobile ? '150px' : '200px',
      borderRadius: '10px',
      margin:'30px',
      overflow: 'hidden',
      boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
      backgroundColor: '#ea145f79',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}
    onMouseEnter={(e) => {
      if (!isMobile) {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.4)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isMobile) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.3)';
      }
    }}
    onClick={() => setSelectedProject(p)}   // 👉 dito mo idagdag
  >
    <img
      src={p.img}
      alt={p.name}
      style={{
        width: '100%',
        height: isMobile ? '120px' : '150px',
        objectFit: 'cover',
      }}
    />
    <p
      style={{
        margin: '5px 0',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '5px',
      }}
    >
      {p.name}
    </p>
  </div>
))}

</div>
</section>


          </div>
        </main>
      {selectedProject && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    }}
    onClick={() => setSelectedProject(null)} // close kapag click sa labas
  >
    <div
      style={{
        position: "relative",
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        textAlign: "center",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={() => setSelectedProject(null)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          backgroundColor: "#A43259",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ✕
      </button>

      {/* ✅ Indicator kung nasa recent project */}
      <span
        style={{
          display: "inline-block",
          padding: "5px 12px",
          borderRadius: "20px",
          backgroundColor: "#28D69F",
          color: "white",
          fontSize: "14px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        📌 Recent Project
      </span>

      <h2 style={{ marginBottom: "10px" }}>{selectedProject.name}</h2>

      <img
        src={selectedProject.img}
        alt={selectedProject.name}
        style={{
          maxWidth: "100%",
          maxHeight: "60vh",
          objectFit: "contain",
          borderRadius: "10px",
          marginBottom: "15px",
        }}
      />

      <p style={{ marginBottom: "10px" }}>{selectedProject.details}</p>
      <p style={{ fontStyle: "italic", color: "#666" }}>
        📅 {selectedProject.date}
      </p>
    </div>
  </div>
)}



      </div>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#28D69F',
          color: 'black',
          padding: isMobile ? '10px 15px' : '15px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          textAlign: 'center',
          gap: isMobile ? '10px' : '0',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>🌿 Barangay Logo</div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <a href="#" style={{ color: 'black' }}>
            <FaFacebook size={20} />
          </a>
          <a href="#" style={{ color: 'black' }}>
            <FaTwitter size={20} />
          </a>
          <a href="#" style={{ color: 'black' }}>
            <FaInstagram size={20} />
          </a>
        </div>

        <div>📞 0917-123-4567</div>
      </footer>
    </div>
  );
}

const menuStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  padding: '10px',
  fontSize: '15px',
  borderRadius: '6px',
  marginBottom: '10px',
  transition: 'background 0.3s',
};

const submenuStyle = {
  ...menuStyle,
  background: '#f2f2f2',
  color: 'black',
  fontSize: '13px',
  width: '90%',
  padding: '6px',
};

const iconStyle = {
  fontSize: '16px',
};
