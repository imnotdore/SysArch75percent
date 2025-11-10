import { useState, useRef } from "react";
import ProjectModal from "../modals/ProjectModal";

export default function ProjectsGallery({ isMobile }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [hoveredProject, setHoveredProject] = useState(null);
  const galleryRef = useRef(null);

  const galleryProjects = [
    {
      id: 1,
      img: '/6.jpg',
      name: 'Sto. Domingo Achievers',
      details: 'Sto. Domingo Achievers',
      date: 'August 15, 2025',
    },
    {
      id: 2,
      img: '/5.jpg',
      name: 'Palarong Lahi',
      details: 'Palarong Lahi',
      date: 'July 20, 2025',
    },
    {
      id: 3,
      img: '/8.jpg',
      name: 'KK Night',
      details: 'KK Night',
      date: 'June 10, 2025',
    },
    {
      id: 4,
      img: '/2.jpg',
      name: 'Basketball Try out',
      details: 'Basketball Try out',
      date: 'May 5, 2025',
    },
    {
      id: 5,
      img: '/3.jpg',
      name: 'Community Cleanup',
      details: 'Community Cleanup Drive',
      date: 'April 20, 2025',
    },
    {
      id: 6,
      img: '/4.jpg',
      name: 'Youth Summit',
      details: 'Annual Youth Summit',
      date: 'March 15, 2025',
    },
  ];

  const handleImageError = (e) => {
    e.target.src = '/pic1.jpg';
    e.target.alt = 'Image not available';
  };

  const scrollLeft = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  const getProjectCardStyle = (isMobile, projectId) => ({
    ...styles.projectCard,
    ...(isMobile && { 
      minWidth: '140px',
    }),
    transform: hoveredProject === projectId ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
    boxShadow: hoveredProject === projectId ? 
      '0 15px 30px rgba(234, 20, 95, 0.4)' : 
      '0 6px 14px rgba(0,0,0,0.3)',
  });

  const getProjectImageStyle = (projectId) => ({
    ...styles.projectImage,
    transform: hoveredProject === projectId ? 'scale(1.1)' : 'scale(1)',
  });

  return (
    <section style={{ 
      marginTop: '20px', 
      padding: isMobile ? '0 10px' : '0 20px', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ marginBottom: '25px', width: '100%' }}>
        <h2 style={isMobile ? {...styles.sectionTitle, fontSize: '20px', marginLeft: '5%'} : styles.sectionTitle}>
          RECENT PROJECTS
        </h2>
        <div style={styles.separator} />
      </div>

      {/* Main Container with Navigation */}
      <div style={styles.mainContainer}>
        {/* Left Navigation Button */}
        <button 
          onClick={scrollLeft}
          style={isMobile ? {...styles.navButton, ...styles.navButtonLeft} : {...styles.navButton, ...styles.navButtonLeft}}
          aria-label="Scroll left"
        >
          ‹
        </button>

        {/* Horizontal Scrollable Container */}
        <div 
          ref={galleryRef}
          style={isMobile ? {...styles.galleryHorizontal, ...styles.galleryHorizontalMobile} : styles.galleryHorizontal}
          className="horizontal-scroll-gallery"
        >
          {galleryProjects.map((project) => (
            <div
              key={project.id}
              style={getProjectCardStyle(isMobile, project.id)}
              onClick={() => setSelectedProject(project)}
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              className="project-card"
            >
              <div style={styles.imageContainer}>
                <img
                  src={project.img}
                  alt={project.name}
                  style={getProjectImageStyle(project.id)}
                  onError={handleImageError}
                  loading="lazy"
                />
                <div style={{
                  ...styles.imageOverlay,
                  opacity: hoveredProject === project.id ? 0.3 : 0,
                }} />
                {hoveredProject === project.id && (
                  <div style={styles.viewOverlay}>
                    <span style={styles.viewText}>Click to View Details</span>
                  </div>
                )}
              </div>
              <p style={{
                ...styles.projectName,
                color: hoveredProject === project.id ? '#ea145f' : '#000',
              }}>
                {project.name}
              </p>
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button 
          onClick={scrollRight}
          style={isMobile ? {...styles.navButton, ...styles.navButtonRight} : {...styles.navButton, ...styles.navButtonRight}}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      {/* Add CSS for better scrolling experience */}
      <style jsx>{`
        .horizontal-scroll-gallery {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .horizontal-scroll-gallery::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .nav-button:hover {
          background: rgba(234, 20, 95, 1) !important;
          transform: scale(1.1) !important;
        }
      `}</style>
    </section>
  );
}

const styles = {
  sectionTitle: {
    color: '#000000',
    fontFamily: 'Oswald, Arial',
    fontWeight: 700,
    textAlign: 'left',
    marginLeft: '7%',
    fontSize: '25px',
    letterSpacing: '1px',
    margin: 5,
    paddingBottom: '20px',
  },
  separator: {
    width: '86%',
    height: '9px',
    background: 'linear-gradient(90deg, #28D69F, #3ED9A2)',
    margin: 'auto',
    borderRadius: '100px',
    border: '1px solid #1F9A78',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  },
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    gap: '10px',
  },
  navButton: {
    background: 'rgba(234, 20, 95, 0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
    zIndex: 10,
    flexShrink: 0,
  },
  navButtonLeft: {
    // Left button stays aligned with gallery
  },
  navButtonRight: {
    // Right button stays aligned with gallery
  },
  galleryHorizontal: {
    display: 'flex',
    gap: '20px',
    padding: '20px 0',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollBehavior: 'smooth',
    cursor: 'grab',
    alignItems: 'flex-start',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    width: 'calc(100% - 120px)', // Space for buttons
    maxWidth: '1200px',
  },
  galleryHorizontalMobile: {
    gap: '15px',
    padding: '15px 0',
    width: 'calc(100% - 100px)', // Less space for mobile buttons
  },
  projectCard: {
    minWidth: '200px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#ea145f79',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  projectImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    transition: 'opacity 0.3s ease',
  },
  viewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 16, 17, 0.68)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.3s ease',
  },
  viewText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px',
  },
  projectName: {
    margin: '8px 0',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '8px 5px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    transition: 'color 0.3s ease',
  },
};

// Alternative: Kung gusto mo mas malapit pa sa edges, ito ang version:
const alternativeStyles = {
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(234, 20, 95, 0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
    zIndex: 10,
  },
  navButtonLeft: {
    left: '10px',
  },
  navButtonRight: {
    right: '10px',
  },
  galleryHorizontal: {
    display: 'flex',
    gap: '20px',
    padding: '20px 60px', // More padding to accommodate buttons
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollBehavior: 'smooth',
    cursor: 'grab',
    alignItems: 'flex-start',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    width: '100%',
  },
};