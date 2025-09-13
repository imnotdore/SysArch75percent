import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaConciergeBell,
  FaFileAlt,
  FaSignOutAlt,
  FaTimes,
  FaHome,
  FaCalendarAlt,
} from 'react-icons/fa';

export default function DisclosureBoard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [previewFile, setPreviewFile] = useState(null);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const disclosureFiles = [
    { id: 1, name: 'Barangay Budget 2025', type: 'pdf', previewUrl: '#' },
    { id: 2, name: 'Annual Project Report', type: 'doc', previewUrl: '#' },
    { id: 3, name: 'Barangay Ordinances', type: 'pdf', previewUrl: '#' },
    { id: 4, name: 'Community Programs', type: 'doc', previewUrl: '#' },
  ];

  return (
    <div
      style={{
        fontFamily: '"Lexend", sans-serif',
        width: '100%',
        overflowX: 'hidden',
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
        {/* Hamburger sa mobile */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'black',
              marginRight: '10px',
            }}
          >
            ☰
          </button>
        )}

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuTWGBGqTAFV1r0LROEwfjVxsqs36wmWQqkQ&s"
            alt="Barangay Logo"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '5px',
              marginRight: '10px',
            }}
          />
        </div>

        <h1
          style={{
            margin: 0,
            textAlign: 'center',
            flex: 1,
            fontSize: isMobile ? '16px' : 'clamp(18px, 2vw, 28px)',
            fontWeight: 'bold',
          }}
        >
          DISCLOSURE BOARD
        </h1>

        <div style={{ width: '34px' }} /> {/* balance placeholder */}
      </header>

      <div style={{ display: 'flex', position: 'relative' }}>
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          style={{
            position: isMobile ? 'fixed' : 'relative',
            top: 0,
            left: sidebarOpen || !isMobile ? 0 : '-240px',
            height: '100vh',
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
          {/* Home */}
          <div
            style={{
              ...menuStyle,
              backgroundColor: '#FFC107',
              color: 'black',
              padding: '10px 15px',
              borderRadius: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              fontWeight: 'bold',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => navigate('/resident/dashboard')}
          >
            <FaHome style={iconStyle} /> Home
          </div>

          {/* Services */}
          <div>
            <div
              style={{
                ...menuStyle,
                backgroundColor: '#F4BE2A',
                color: 'black',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(10px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
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
                  style={{
                    ...submenuStyle,
                    backgroundColor: '#1E90FF',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(10px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
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
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(10px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
                  onClick={() => navigate('/resident/schedule')}
                >
                  <FaCalendarAlt style={iconStyle} /> Schedule
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
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

        {/* Main content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? '15px 10px' : '20px',
            overflowY: 'auto',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '15px',
            }}
          >
            {disclosureFiles.map((file) => (
              <div
                key={file.id}
                style={{
                  backgroundColor: '#f2f2f2',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
                onClick={() => setPreviewFile(file)}
              >
                {file.name}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* File Preview */}
      {previewFile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '10px',
            boxSizing: 'border-box',
          }}
          onClick={() => setPreviewFile(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              minWidth: '300px',
              maxWidth: '600px',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewFile(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
              }}
            >
              <FaTimes />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaFileAlt size={40} />
              <div>{previewFile.name}</div>
            </div>
          </div>
        </div>
      )}

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
          gap: isMobile ? '8px' : '0',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>🌿 Barangay Logo</div>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
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
  fontSize: '13px',
  width: '90%',
  padding: '6px',
};

const iconStyle = { fontSize: '16px' };
