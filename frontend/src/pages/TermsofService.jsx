import React from "react";

export default function TermsOfService() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f6fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          padding: "30px",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Terms of Service
        </h1>
        <p style={{ textAlign: "center", color: "#555", marginBottom: "30px" }}>
          <strong>Effective Date:</strong> August 19, 2025
        </p>

        <h2>1. Use of the System</h2>
        <p>
          Residents may use this system to upload files, request documents, and
          access barangay-related services. Users must provide accurate and true
          information when registering or submitting requests.
        </p>

        <h2>2. File Uploads</h2>
        <p>
          Only PDF and DOCX files are allowed. Uploading harmful, illegal, or
          inappropriate content is strictly prohibited.
        </p>

        <h2>3. Privacy and Security</h2>
        <p>
          We do not sell or share your personal information outside the barangay
          office. Uploaded files will only be used for processing your requests.
        </p>

        <h2>4. Accountability</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account. Any misuse of the system may lead to suspension of access.
        </p>

        <h2>5. Changes to Terms</h2>
        <p>
          The barangay reserves the right to update these Terms at any time.
          Continued use of the system means you accept the updated Terms.
        </p>
      </div>
    </div>
  );
}
    