import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaConciergeBell, FaFileAlt, FaSignOutAlt, FaTimes, FaHome } from 'react-icons/fa';

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
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
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
    <div style={{ fontFamily: '"Lexend", sans-serif', width: '100%', overflowX: 'hidden', minHeight: '100%' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#F4BE2A',
        padding: isMobile ? '12px 10px' : '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // center header text
        position: 'sticky',
        top: 0,
        zIndex: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        width: '100%' // full width for mobile
      }}>
        {/* Disclosure Board */}
        <span style={{
          backgroundColor: '#A43259',
          color: 'white',
          padding: isMobile ? '10px 5px' : '25px 5px',
          borderRadius: '2px',
          fontWeight: '1000',
          fontSize: isMobile ? '18px' : 'clamp(5px,4vw,28px)',
          letterSpacing: '1px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          display: 'inline-block',
          flex: 1,
          textAlign: 'center'
        }}>
          DISCLOSURE BOARD
        </span>
      </header>

      {/* Mobile Home Button */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', backgroundColor: '#fff' }}>
          <button
            onClick={() => navigate('/resident/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: '#32a469ff',
              color: 'white',
              border: 'none',
              padding: '4px 10px', // smaller padding
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '13px', // slightly smaller font
              fontWeight: 'bold'
            }}
          >
            <FaHome /> Home
          </button>
        </div>
      )}

      {/* Sidebar + Main */}
      <div style={{ display: 'flex', flexDirection: 'row', position: 'relative' }}>
        {/* Sidebar */}
        <div ref={sidebarRef} style={{
          width: 220,
          backgroundColor: '#A43259',
          color: 'white',
          transition: 'transform 0.3s ease',
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          height: isMobile ? '100vh' : 'auto',
          transform: isMobile ? `translateX(${sidebarOpen ? '0' : '-100%'})` : 'translateX(0)',
          zIndex: 1000,
          padding: '30px 5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          boxSizing: 'border-box'
        }}>
          {/* Desktop Home Button */}
          {!isMobile && (
            <button
              onClick={() => navigate('/resident/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2af43bff',
                color: '#A43259',
                border: 'none',
                padding: '10px 12px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}
            >
              <FaHome /> Home
            </button>
          )}

          {/* Logout Button */}
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <div style={{ backgroundColor: '#F4BE2A', padding: '5px', borderRadius: '6px' }}>
              <button onClick={handleLogout} style={{ ...menuStyle, backgroundColor: '#ff0000ff', color: 'white', width: '100%', justifyContent: 'center', fontWeight: 'bold' }}>
                <FaSignOutAlt style={iconStyle} /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 900, transition: '0.3s' }} />}

        {/* Main content */}
        <main style={{ flex: 1, padding: isMobile ? '15px 10px' : '20px', overflowY: 'auto', minHeight: '100vh', boxSizing: 'border-box' }}>
          {/* Disclosure Files */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
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
                  textAlign: 'center'
                }}
                onClick={() => setPreviewFile(file)}
              >
                {file.name}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* File Preview Overlay */}
      {previewFile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '10px', boxSizing: 'border-box' }} onClick={() => setPreviewFile(null)}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', minWidth: '300px', maxWidth: '600px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewFile(null)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
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
      <footer style={{ backgroundColor: '#28D69F', color: 'black', padding: isMobile ? '10px 15px' : '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : '0' }}>
        <div style={{ fontWeight: 'bold' }}>🌿 Barangay Logo</div>
        <div style={{ display:'flex', gap:'15px', justifyContent:'center' }}>
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">Instagram</a>
        </div>
        <div>📞 0917-123-4567</div>
      </footer>
    </div>
  );
}

// Styles
const menuStyle = { display:'flex', alignItems:'center', gap:'5px', background:'white', color:'black', cursor:'pointer', padding:'10px', fontSize:'15px', borderRadius:'4px', width:'90%', textAlign:'left', margin:'0 auto', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', boxSizing:'border-box' };
const submenuStyle = { ...menuStyle, background:'#f2f2f2', fontSize:'13px', width:'85%', padding:'6px' };
const iconStyle = { fontSize:'16px' };
