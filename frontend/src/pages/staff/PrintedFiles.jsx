// src/components/PrintedFiles.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./PrintedFiles.css";

export default function PrintedFiles({ axiosAuth }) {
  const [printedFiles, setPrintedFiles] = useState([]);
  const [selectedPrinted, setSelectedPrinted] = useState(null);

  // Fetch printed files
  const fetchPrintedFiles = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/staff/printed-files", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      setPrintedFiles(res.data);
    } catch (err) {
      console.error("Error fetching printed files:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchPrintedFiles();
  }, []);

  return (
    <section className="printed-list">
      <h2>Printed Files</h2>
      {printedFiles.length === 0 ? (
        <p>No printed files yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Filename</th>
              <th>Printed By</th>
              <th>Date Printed</th>
            </tr>
          </thead>
          <tbody>
            {printedFiles.map((file) => (
              <tr key={file.id} onClick={() => setSelectedPrinted(file)}>
                <td>{file.resident_username || `Resident#${file.resident_id}`}</td>
                <td>{file.filename}</td>
                <td>{file.staff_username}</td>
                <td>{new Date(file.printed_at).toLocaleString("en-PH")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Preview */}
      {selectedPrinted && (
        <div className="modal-overlay" onClick={() => setSelectedPrinted(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedPrinted.filename}</h2>
            <iframe
              src={`${import.meta.env.VITE_API_URL}/uploads/${selectedPrinted.filename}`}
              width="100%"
              height="400px"
              title={selectedPrinted.filename}
            />
            <div className="modal-actions">
              <button className="btn-gray" onClick={() => setSelectedPrinted(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
