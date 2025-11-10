import { FaBars } from "react-icons/fa";

export default function ResidentHeader({ title, sidebarOpen, setSidebarOpen, isMobile }) {
  const username = localStorage.getItem("username") || "";

  return (
    <header style={styles.header}>
      {isMobile && (
        <FaBars 
          size={24} 
          style={{ cursor: "pointer", marginRight: "15px" }} 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
        />
      )}
      
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuTWGBGqTAFV1r0LROEwfjVxsqs36wmWQqkQ&s"
          alt="Barangay Logo"
          style={styles.logo}
        />
        {username && (
          <span style={styles.welcomeText}>Welcome, {username}!</span>
        )}
      </div>

      <h1 style={styles.title}>{title}</h1>

      <div style={{ width: "34px" }} /> {/* Balance placeholder */}
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#F4BE2A",
    color: "black",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position:" relative",
    top: 0,
    zIndex: 999,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
  },
  logo: {
    width: "50px",
    height: "50px",
    borderRadius: "5px",
  },
  welcomeText: {
    fontWeight: "bold",
    fontSize: "18px",
    color: "black",
  },
  title: {
    margin: 0,
    textAlign: "center",
    flex: 1,
    fontSize: "clamp(16px, 2vw, 28px)",
    fontWeight: "bold",
  },
};