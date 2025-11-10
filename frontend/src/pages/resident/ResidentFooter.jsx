import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function ResidentFooter({ isMobile }) {
  return (
    <footer style={{
      ...styles.footer,
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "10px" : "0",
    }}>
      <div style={styles.footerItem}>🌿 Barangay Logo</div>

      <div style={styles.socialLinks}>
        <a href="#" style={styles.socialLink}><FaFacebook size={20} /></a>
        <a href="#" style={styles.socialLink}><FaTwitter size={20} /></a>
        <a href="#" style={styles.socialLink}><FaInstagram size={20} /></a>
      </div>

      <div style={styles.footerItem}>📞 0917-123-4567</div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#28D69F",
    color: "black",
    padding: "15px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
  },
  footerItem: {
    fontWeight: "bold",
  },
  socialLinks: {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
  },
  socialLink: {
    color: "black",
  },
};