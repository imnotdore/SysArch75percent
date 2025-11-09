const StaffFooter = () => {
  return (
    <footer className="staff-footer">
      <div className="footer-content">
        <span>🌿 Barangay Management System</span>
        <span>📞 0917-123-4567</span>
        <span>© {new Date().getFullYear()} All rights reserved</span>
      </div>
    </footer>
  );
};

export default StaffFooter;