import axios from "axios";
import { useState } from "react";


export default function AcceptedTab({
  acceptedFiles,
  acceptedSchedules,
  setSelectedAccepted,
  fetchPrintedFiles
}) {
  const token = localStorage.getItem("token");
  const [sendingEmail, setSendingEmail] = useState(null);
  
  const axiosAuth = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    headers: { Authorization: `Bearer ${token}` },
  });

  const handleNotifySchedule = async (scheduleId) => {
    try {
      await axiosAuth.put(`/api/staff/schedules/${scheduleId}/notify`);
      alert("Resident notified! Status updated to 'Ready'.");
    } catch (err) {
      console.error(err);
      alert("Failed to notify resident.");
    }
  };

  const handleEmailResident = async (schedule) => {
  setSendingEmail(schedule.id);
  
  try {
    const response = await axiosAuth.post(`/api/staff/schedules/${schedule.id}/email`, {
      subject: "Your Borrowed Item is Ready for Pickup",
      message: `Dear ${schedule.resident_username || 'Resident'},

Your requested item "${schedule.item}" (Quantity: ${schedule.quantity}) is now ready for pickup.

Borrowing Details:
- Item: ${schedule.item}
- Quantity: ${schedule.quantity}
- Borrow Date: ${new Date(schedule.date_from).toLocaleDateString('en-PH')}
- Return Date: ${new Date(schedule.date_to).toLocaleDateString('en-PH')}
- Time: ${schedule.time_from} - ${schedule.time_to}

Please visit the office during office hours to pick up your item.

Thank you,
Equipment Management System`
    });

    if (response.data.success) {
      alert("✅ Resident notified successfully! Status updated to 'Ready'.");
      
      // Refresh the data
      if (fetchPrintedFiles) {
        fetchPrintedFiles();
      }
    }
  } catch (err) {
    console.error("Email error:", err);
    alert(`❌ Failed to notify resident: ${err.response?.data?.error || 'Please try again.'}`);
  } finally {
    setSendingEmail(null);
  }
};



  return (
    <section className="accepted-list">
      <h2>Accepted Requests</h2>

      {/* Files */}
      <h3>Files</h3>
      {acceptedFiles.length === 0 ? (
        <p>No accepted files.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>File Name</th>
              <th>Approved By</th>
              <th>Date Approved</th>
            </tr>
          </thead>
          <tbody>
            {acceptedFiles.map((f) => (
              <tr
                key={`accepted-file-${f.id}`}
                onClick={() => setSelectedAccepted({ ...f, type: "File" })}
                style={{ cursor: "pointer" }}
              >
                <td>{f.resident_username || `Resident#${f.resident_id}`}</td>
                <td>{f.filename}</td>
                <td>{f.staff_username}</td>
                <td> 
                  {f.approved_at
                    ? f.approved_at.toLocaleString("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Schedules */}
      <h3>Schedules</h3>
      {acceptedSchedules.length === 0 ? (
        <p>No accepted schedules.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Approved By</th>
              <th>Date Approved</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {acceptedSchedules.map((s) => {
              const status = (s.status || "Approved").toLowerCase();
              const isNotified = status === "ready" || status === "to pick up";
              const isClaimed = status === "claimed";

              return (
                <tr
                  key={`accepted-schedule-${s.id}`}
                  style={{ cursor: "pointer", opacity: isClaimed ? 0.5 : 1 }}
                >
                  <td onClick={() => setSelectedAccepted({ ...s, type: "Schedule" })}>
                    {s.resident_username || `Resident#${s.user_id}`}
                  </td>
                  <td onClick={() => setSelectedAccepted({ ...s, type: "Schedule" })}>
                    {s.item}
                  </td>
                  <td onClick={() => setSelectedAccepted({ ...s, type: "Schedule" })}>
                    {s.quantity}
                  </td>
                  <td onClick={() => setSelectedAccepted({ ...s, type: "Schedule" })}>
                    {s.staff_username}
                  </td>
                  <td onClick={() => setSelectedAccepted({ ...s, type: "Schedule" })}>
                    {s.approved_at
                      ? s.approved_at.toLocaleString("en-PH", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </td>
                  <td onClick={() => setSelectedAccepted({ ...s, type: "Schedule" })}>
                    <span className={`status-badge ${status.replace(' ', '-')}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    {!isClaimed && !isNotified && (
                      <button
                        className="email-button"
                        onClick={() => handleEmailResident(s)}
                        disabled={sendingEmail === s.id}
                        title="Email resident that item is ready for pickup"
                      >
                        {sendingEmail === s.id ? (
                          <>
                            <span className="loading-spinner"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            📧 Email Resident
                          </>
                        )}
                      </button>
                    )}
                    {isNotified && (
                      <span className="email-sent-badge">✅ Emailed</span>
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