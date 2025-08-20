import React from "react";

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.6",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Privacy Policy
      </h1>
      <p>
        <strong>Effective Date:</strong> August 19, 2025
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Name, email, and contact details upon registration.</li>
        <li>Uploaded files (PDF/DOCX) for request processing.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To process barangay requests (e.g., certificates, equipment borrow).</li>
        <li>To verify your identity as a resident.</li>
      </ul>

      <h2>3. Data Protection</h2>
      <p>
        We implement security measures to protect your personal data. Only
        authorized staff and admins can access your files.
      </p>

      <h2>4. Sharing of Information</h2>
      <p>Your data is not shared with third parties, unless required by law.</p>

      <h2>5. Your Rights</h2>
      <p>
        You may request access, correction, or deletion of your personal data by
        contacting the barangay office.
      </p>

      <h2>6. Updates to this Policy</h2>
      <p>
        We may revise this Privacy Policy when necessary. Updates will be posted
        on the system.
      </p>

      <p style={{ marginTop: "30px", fontStyle: "italic", textAlign: "center" }}>
        If you have questions regarding this Privacy Policy, please contact your
        Barangay Office.
      </p>
    </div>
  );
}
