import { useState, useEffect } from "react";
import ResidentLayout from "./ResidentLayout";
import AnnouncementsSection from "./sections/AnnouncementsSection";
import ProjectsGallery from "./sections/ProjectsGallery";

export default function ResidentDashboard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const projectVideoUrl = 'https://media.istockphoto.com/id/2191922460/video/mountainous-horizon-in-lipa-city-batangas.mp4?s=mp4-640x640-is&k=20&c=r1kao0Cgr_BE6vEOqm0z2y_R2joO1xjNm00qD4_lUO0=';
  
  const sidePictures = [
    '/7.jpg',
    '/1.jpg',
    '/3.jpg',
    '/4.jpg',
  ]; 

  const handleImageClick = (src) => {
    setSelectedImage(src);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <ResidentLayout title="Mabuhay Katipunan ng Kabataan!">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AnnouncementsSection />

        {/* Video + Pictures */}
        <section style={isMobile ? {...styles.mediaSection, flexDirection: 'column', gap: '20px'} : styles.mediaSection}>
          {/* Video */}
          <div style={isMobile ? {...styles.videoContainer, width: '100%'} : styles.videoContainer}>
            <video 
              controls 
              style={styles.video}
            >
              <source src={projectVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p style={styles.videoCaption}>Current Projects Video</p>
          </div>

          {/* Pictures */}
          <div style={isMobile ? {...styles.picturesContainer, flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'center'} : styles.picturesContainer}>
            {sidePictures.map((src, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.sidePictureWrapper,
                  transform: hoveredImage === idx ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredImage(idx)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => handleImageClick(src)}
              >
                <img
                  src={src}
                  alt={`Side Picture ${idx + 1}`}
                  style={{
                    ...styles.sidePicture,
                    filter: hoveredImage === idx ? 'brightness(1.1)' : 'brightness(1)',
                  }}
                />
                {hoveredImage === idx && (
                  <div style={styles.hoverOverlay}>
                    <span style={styles.hoverText}>Click to View</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <ProjectsGallery isMobile={isMobile} />

        {/* Image Modal */}
        {selectedImage && (
          <div style={styles.modalOverlay} onClick={handleCloseModal}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeButton} onClick={handleCloseModal}>×</button>
              <img 
                src={selectedImage} 
                alt="Enlarged view" 
                style={styles.enlargedImage} 
              />
              
            </div>
          </div>
        )}
      </div>

      {/* Add CSS styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ResidentLayout>
  );
}

const styles = {
  mediaSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: '50px',
    marginTop: '20px',
    alignItems: 'flex-start',
    transition: 'all 0.3s ease',
  },
  videoContainer: {
    flex: 1,
    border: '3px solid black',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
    overflow: 'hidden',
    backgroundColor: '#F4BE2A',
    minHeight: '300px',
    transition: 'all 0.3s ease',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'all 0.3s ease',
  },
  videoCaption: {
    textAlign: 'center',
    marginTop: '10px',
    fontWeight: '1000',
    fontSize: '14px',
  },
  picturesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '200px',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  sidePictureWrapper: {
    position: 'relative',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sidePicture: {
    width: '150px',
    height: '120px',
    borderRadius: '12px',
    border: '3px solid black',
    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
    objectFit: 'cover',
    transition: 'all 0.3s ease',
  },
  hoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 8, 8, 0.41)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    animation: 'fadeIn 0.3s ease',
  },
  hoverText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease',
  },
  modalContent: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '90%',
    maxHeight: '90%',
    animation: 'slideUp 0.3s ease',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '30px',
    cursor: 'pointer',
    color: '#333',
    zIndex: 1001,
  },
  enlargedImage: {
    maxWidth: '100%',
    maxHeight: '70vh',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  modalControls: {
    marginTop: '15px',
    textAlign: 'center',
  },
  
};

// Alternative: Kung ayaw gumana yung style jsx, ilagay mo ito sa main CSS file mo
const addGlobalStyles = () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    @media (max-width: 768px) {
      .side-picture-mobile {
        width: 120px !important;
        height: 100px !important;
      }
    }
  `;
  document.head.appendChild(styleElement);
};

// Call this function once
if (typeof document !== 'undefined') {
  addGlobalStyles();
}