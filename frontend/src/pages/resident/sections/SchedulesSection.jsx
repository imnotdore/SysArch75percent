import { useContext, useState } from "react";
import { ScheduleContext } from "../../../context/ScheduleContext";
import StatusBadge from "../common/StatusBadge";
import DateFormatter from "../common/DateFormatter";
import TimeFormatter from "../common/TimeFormatter";

export default function SchedulesSection() {
  const { schedules, cancelSchedule } = useContext(ScheduleContext);
  const [loadingCancel, setLoadingCancel] = useState(null);

  const handleCancelSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to cancel this schedule?")) {
      return;
    }

    try {
      setLoadingCancel(scheduleId);
      await cancelSchedule(scheduleId);
      // Success message will be handled by the context
    } catch (error) {
      console.error("Failed to cancel schedule:", error);
      alert("Failed to cancel schedule. Please try again.");
    } finally {
      setLoadingCancel(null);
    }
  };

  const getDueDate = (schedule) => {
    if (!schedule.date_from) return "N/A";
    
    const dateIssued = new Date(schedule.date_from);
    const durationDays = schedule.duration ?? 2;
    const dueDate = new Date(dateIssued);
    dueDate.setDate(dueDate.getDate() + durationDays);
    
    return dueDate;
  };

  if (!schedules || schedules.length === 0) {
    return (
      <section style={styles.section}>
        <p style={styles.noData}>No schedules yet.</p>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Your Schedules</h2>
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Date Issued</th>
              <th style={styles.th}>Due Date</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} style={styles.tableRow}>
                <td style={styles.td}>{schedule.item || "N/A"}</td>
                <td style={styles.td}>
                  <DateFormatter date={schedule.date_from} />
                </td>
                <td style={styles.td}>
                  <DateFormatter date={getDueDate(schedule)} />
                </td>
                <td style={styles.td}>
                  <TimeFormatter time={schedule.time_from} /> - {" "}
                  <TimeFormatter time={schedule.time_to} />
                </td>
                <td style={styles.td}>{schedule.quantity || 1}</td>
                <td style={styles.td}>
                  <StatusBadge status={schedule.status} />
                </td>
                <td style={styles.td}>{schedule.reason || "-"}</td>
                <td style={styles.td}>
                  {schedule.status?.toLowerCase() === "pending" && (
                    <button
                      onClick={() => handleCancelSchedule(schedule.id)}
                      disabled={loadingCancel === schedule.id}
                      style={{
                        ...styles.cancelButton,
                        opacity: loadingCancel === schedule.id ? 0.6 : 1
                      }}
                    >
                      {loadingCancel === schedule.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                  {schedule.status?.toLowerCase() === "approved" && (
                    <span style={styles.approvedText}>Approved</span>
                  )}
                  {schedule.status?.toLowerCase() === "rejected" && (
                    <span style={styles.rejectedText}>Rejected</span>
                  )}
                  {schedule.status?.toLowerCase() === "cancelled" && (
                    <span style={styles.cancelledText}>Cancelled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const styles = {
  section: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#28D69F",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    padding: "40px",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px",
  },
  tableHeader: {
    backgroundColor: "#F4BE2A",
  },
  th: {
    padding: "12px 8px",
    textAlign: "center",
    fontWeight: "bold",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  tableRow: {
    borderBottom: "1px solid #eee",
  },
  td: {
    padding: "10px 8px",
    textAlign: "center",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  cancelButton: {
    backgroundColor: "#ff4d4f",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
  approvedText: {
    color: "green",
    fontWeight: "bold",
    fontSize: "12px",
  },
  rejectedText: {
    color: "red",
    fontWeight: "bold",
    fontSize: "12px",
  },
  cancelledText: {
    color: "gray",
    fontWeight: "bold",
    fontSize: "12px",
  },
};