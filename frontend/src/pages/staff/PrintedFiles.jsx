import { useState, useEffect } from "react";
import axios from "axios";

export default function PrintedTab({ axiosAuth }) {
  const [printedFiles, setPrintedFiles] = useState([]);

  const fetchPrintedFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/staff/printed-files", {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleAction = async (file) => {
    try {
      const status = (file.status || "printed").toLowerCase();
      if (status === "printed") {
        await axiosAuth.put(`/api/staff/printed-files/${file.id}/notify`);
        setPrintedFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, status: "Ready to Pick Up" } : f)
        );
      } else if (status === "ready to pick up") {
        await axiosAuth.put(`/api/staff/printed-files/${file.id}/claim`);
        setPrintedFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, status: "Claimed" } : f)
        );
      }
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {printedFiles.map(file => {
              const status = (file.status || "Printed").toLowerCase();
              const isClaimed = status === "claimed";
              const isReady = status === "ready to pick up";
              return (
                <tr key={file.id} style={{ opacity: isClaimed ? 0.5 : 1, pointerEvents: isClaimed ? "none" : "auto" }}>
                  <td>{file.resident_username || `Resident#${file.resident_id}`}</td>
                  <td>{file.filename}</td>
                  <td>{file.staff_username}</td>
                  <td>{new Date(file.printed_at).toLocaleString("en-PH")}</td>
                  <td>{status.replace(/\b\w/g, c => c.toUpperCase())}</td>
                  <td>
                    {!isClaimed && (
                      <button className={isReady ? "btn-green" : "btn-yellow"} onClick={() => handleAction(file)}>
                        {isReady ? "Mark as Claimed" : "Notify Resident"}
                      </button>
                    )}
                    {isClaimed && <span>Claimed</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
