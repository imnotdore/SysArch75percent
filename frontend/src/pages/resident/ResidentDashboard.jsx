import { useState, useEffect } from "react";
import ResidentLayout from "./ResidentLayout";
import AnnouncementsSection from "./sections/AnnouncementsSection";
import ProjectsGallery from "./sections/ProjectsGallery";
import "./ResidentDashboard.css";

export default function ResidentDashboard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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
    '/2.jpg',
    '/5.jpg',
  ]; 

  const handleImageClick = (src) => {
    setSelectedImage(src);
    setModalLoading(true);
    
    const img = new Image();
    img.src = src;
    img.onload = () => setModalLoading(false);
    img.onerror = () => setModalLoading(false);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setModalLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleCloseModal();
  };

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  return (
    <ResidentLayout title="Mabuhay Katipunan ng Kabataan!">
      <div className="dashboard-container">
        <AnnouncementsSection />

        <section className={`media-section ${isMobile ? 'mobile' : ''}`}>
          <div className="video-container">
            <div className="video-wrapper">
              <video 
                controls 
                className="project-video"
                preload="metadata"
              >
                <source src={projectVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-overlay">
                <span className="video-badge">LATEST</span>
              </div>
            </div>
            <p className="video-caption">Current Projects Video</p>
          </div>

          <div className={`pictures-container ${isMobile ? 'mobile' : ''}`}>
            <div className="pictures-header">
              <h3 className="pictures-title">
                <svg className="gallery-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                Gallery Preview
              </h3>
              <span className="pictures-count">{sidePictures.length} images</span>
            </div>
            
            <div className="pictures-scroll-container">
              <div className="pictures-grid">
                {sidePictures.map((src, idx) => (
                  <div
                    key={idx}
                    className={`picture-card ${hoveredImage === idx ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredImage(idx)}
                    onMouseLeave={() => setHoveredImage(null)}
                    onClick={() => handleImageClick(src)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleImageClick(src)}
                  >
                    <div className="picture-wrapper">
                      <img
                        src={src}
                        alt={`Gallery Image ${idx + 1}`}
                        className="side-picture"
                        loading="lazy"
                      />
                      <div className="picture-overlay">
                        <span className="overlay-text">
                          <svg className="zoom-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                          </svg>
                          View Full Size
                        </span>
                      </div>
                      <div className="picture-number">{idx + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="view-more-container">
              <button className="view-more-btn">
                <span>View Full Gallery</span>
                <svg className="arrow-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

        <ProjectsGallery isMobile={isMobile} />

        {selectedImage && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={handleCloseModal}
                aria-label="Close image viewer"
              >
                <svg className="close-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
              
              <div className="modal-content">
                {modalLoading ? (
                  <div className="image-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading image...</p>
                  </div>
                ) : (
                  <img 
                    src={selectedImage} 
                    alt="Enlarged view" 
                    className="enlarged-image"
                    onLoad={() => setModalLoading(false)}
                  />
                )}
              </div>
              
              <div className="modal-navigation">
                <p className="image-instruction">
                  Press ESC or click outside to close
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResidentLayout>
  );
}