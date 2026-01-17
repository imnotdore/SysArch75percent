import axios from "axios";
import { FaFileAlt, FaUser, FaPrint, FaBell, FaCheckCircle } from "react-icons/fa";

export default function PrintedTab({ printedFiles }) {
  const token = localStorage.getItem("token");
  const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Sa handleFileAction function:
const handleFileAction = async (fileId, currentStatus) => {
  try {
    if (currentStatus === "printed") {
      // Notify resident (update to "go_to_pickup")
      await axiosAuth.put(`/api/staff/printed-files/${fileId}/notify`);
      alert("✅ Resident notified! Status updated to 'Ready to Pick Up'.");
    } else if (currentStatus === "go_to_pickup") {
      // Mark as claimed
      await axiosAuth.put(`/api/staff/printed-files/${fileId}/claim`);
      alert("✅ File marked as claimed!");
    }
    // Refresh the data
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("❌ Action failed. Please try again.");
  }
};

  const getInitials = (name) => {
    if (!name) return "R";
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

 const getStatusBadgeClass = (status) => {
  const statusLower = status.toLowerCase();
  if (statusLower === "claimed") return "claimed";
  if (statusLower === "released") return "ready"; // "released" = "Go to Pick Up"
  if (statusLower === "printed") return "printed";
  return "pending";
};
const getStatusText = (status) => {
  const statusLower = status.toLowerCase();
  switch(statusLower) {
    case 'go_to_pickup': return 'Ready to Pick Up';
    case 'printed': return 'Printed';
    case 'claimed': return 'Claimed';
    case 'pending': return 'Pending';
    case 'approved': return 'Approved';
    case 'released': return 'Released'; // For schedules
    case 'ready': return 'Ready'; // For schedules
    default: return status;
  }
};
  return (
    <section className="printed-list">
      <h2>Printed Files</h2>
      
      {printedFiles.length === 0 ? (
        <div className="empty-state">
          <h3>No Printed Files</h3>
          <p>Files that have been printed will appear here.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>File</th>
              <th>Printed By</th>
              <th>Date Printed</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {printedFiles.map((file) => {
              const statusRaw = file.status || "Printed";
              const status = statusRaw.toLowerCase();
              const isClaimed = status === "claimed";
              const isReady = status.includes("ready");
              const isPrinted = status === "printed";

              let buttonLabel = isReady ? "Mark as Claimed" : "Notify Resident";
              let buttonIcon = isReady ? <FaCheckCircle /> : <FaBell />;
              let buttonClass = isReady ? "btn-green" : "btn-yellow";

              return (
                <tr
                  key={file.id}
                  className={isClaimed ? "claimed-row" : ""}
                >
                  <td>
                    <div className="resident-info">
                      <div className="resident-avatar">
                        {getInitials(file.resident_username)}
                      </div>
                      <span className="resident-name">
                        {file.resident_username || `Resident#${file.resident_id}`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="file-info">
                      <FaFileAlt className="file-icon" />
                      <span className="file-name" title={file.filename}>
                        {file.filename}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="staff-info">
                      <FaUser size={12} />
                      <span className="staff-badge">
                        {file.staff_username || "Staff"}
                      </span>
                    </div>
                  </td>
                  <td className="date-cell">
                    {formatDate(file.printed_at)}
                  </td>
                  <td>
                    <span 
                      className={`status-badge ${getStatusBadgeClass(status)}`}
                      title={statusRaw}
                    >
                      
                      {getStatusText(status)}
                    </span>
                  </td>
                  <td>
                    {!isClaimed ? (
                      <button
                        className={buttonClass}
                        onClick={() => handleFileAction(file.id, status)}
                        title={buttonLabel}
                      >
                        {buttonIcon}
                        {buttonLabel}
                      </button>
                    ) : (
                      <span className="claimed-text">
                        <FaCheckCircle /> Claimed
                      </span>
                    )}
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