import axios from "axios";

export default function AcceptedTab({
  acceptedFiles,
  acceptedSchedules,
  setSelectedAccepted,
  fetchPrintedFiles
}) {
  const token = localStorage.getItem("token");
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
                  onClick={() => setSelectedAccepted({ ...s, type: "Schedule" })}
                  style={{ cursor: "pointer", opacity: isClaimed ? 0.5 : 1 }}
                >
                  <td>{s.resident_username || `Resident#${s.user_id}`}</td>
                  <td>{s.item}</td>
                  <td>{s.quantity}</td>
                  <td>{s.staff_username}</td>
                  <td>
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
                  <td>
                    <span className={`status-badge ${status}`}>{status}</span>
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