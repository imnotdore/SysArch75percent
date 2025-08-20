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
    'https://i.pinimg.com/736x/52/86/5e/52865ed87c040c24e985b8de37f66afe.jpg',
    'https://i.pinimg.com/736x/9a/82/56/9a825639f9b7f73a9ba7ba2091305b4d.jpg',
    'https://i.pinimg.com/474x/ae/4c/3b/ae4c3bd955d744880aa3646dd4a842ad.jpg',
  ];

  const galleryProjects = [
    {
      id: 1,
      img: 'https://i.pinimg.com/736x/9a/82/56/9a825639f9b7f73a9ba7ba2091305b4d.jpg',
      name: 'Road Improvement Project',
    },
    {
      id: 2,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReCX6yHAZubHcIB8Y3pmNlUCa8cxIP2vKETfXaji2nNzVNaf-36e756b5-KyrtpQDm37Y&usqp=CAU',
      name: 'Community Library',
    },
    {
      id: 3,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThxURH9aik0oxxhj4SR5Su48l0ynhMrdpr5g&s',
      name: 'Barangay Hall Renovation',
    },
    {
      id: 4,
      img: 'https://i.pinimg.com/474x/ae/4c/3b/ae4c3bd955d744880aa3646dd4a842ad.jpg',
      name: 'Drainage System Upgrade',
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

  {/* Barangay Logo */}
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuTWGBGqTAFV1r0LROEwfjVxsqs36wmWQqkQ&s"
      alt="Barangay Logo"
      style={{ width: '50px', height: '50px', borderRadius: '5px', marginRight: '10px' }}
    />
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
              textAlign: 'center',
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#922A4C',
              borderRadius: '8px',
            }}
          >
            <FaUserCircle size={50} color="white" />
            <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Your Account</p>
            <p style={{ fontSize: '14px' }}>Resident</p>
          </div>

          <div
            style={menuStyle}
            onClick={() => navigate('/resident/disclosure-board')}
          >
            <FaClipboardList style={iconStyle} /> Disclosure Board
          </div>

          <div>
            <div
              style={menuStyle}
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
              >
                <div
                  style={submenuStyle}
                  onClick={() => navigate('/resident/request')}
                >
                  <FaFileAlt style={iconStyle} /> Requests
                </div>
                <div
                  style={submenuStyle}
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
              <h2>Announcements</h2>
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
        flex: '0 0 auto', // important para hindi lumaki o lumiit
        width: isMobile ? '150px' : '200px',
        borderRadius: '10px',
        margin:'30px',
        overflow: 'hidden',
        boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
        backgroundColor: '#A43259',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease', // smooth hover effect
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
