export default function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>✕</button>
        
        <span style={styles.badge}>📌 Recent Project</span>
        
        <h2 style={styles.title}>{project.name}</h2>

        <img
          src={project.img}
          alt={project.name}
          style={styles.image}
        />

        <p style={styles.details}>{project.details}</p>
        <p style={styles.date}>📅 {project.date}</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
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
  },
  modal: {
    position: "relative",
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    textAlign: "center",
  },
  closeButton: {
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
  },
  badge: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: "20px",
    backgroundColor: "#28D69F",
    color: "white",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  title: {
    marginBottom: "10px",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "60vh",
    objectFit: "contain",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  details: {
    marginBottom: "10px",
  },
  date: {
    fontStyle: "italic",
    color: "#666",
  },
};