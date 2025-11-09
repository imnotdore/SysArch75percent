import { FaUser, FaBox, FaUserCheck, FaCalendarAlt } from "react-icons/fa";

export default function ScheduledTab({ acceptedSchedules }) {
  const getInitials = (name) => {
    if (!name) return "R";
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-PH", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString("en-PH", {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <section className="scheduled-list">
      <div className="section-header">
        <h2>Scheduled Items</h2>
        <span className="section-count">
          {acceptedSchedules.length}
        </span>
      </div>
      
      {acceptedSchedules.length === 0 ? (
        <div className="empty-state">
          <h3>No Scheduled Items</h3>
          <p>Approved schedule requests will appear here.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Approved By</th>
              <th>Date Approved</th>
            </tr>
          </thead>
          <tbody>
            {acceptedSchedules.map((schedule) => {
              const formattedDate = formatDate(schedule.approved_at);
              
              return (
                <tr key={`scheduled-${schedule.id}`}>
                  <td>
                    <div className="resident-info">
                      <div className="resident-avatar">
                        {getInitials(schedule.resident_username)}
                      </div>
                      <span className="resident-name">
                        {schedule.resident_username || `Resident#${schedule.user_id}`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="item-info">
                      <FaBox className="item-icon" />
                      <span className="item-name" title={schedule.item}>
                        {schedule.item}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="quantity-badge">
                      {schedule.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="staff-info">
                      <FaUserCheck size={12} />
                      <span className="staff-badge">
                        {schedule.staff_username || "Staff"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <span className="date-main">{formattedDate.date}</span>
                      <span className="date-time">{formattedDate.time}</span>
                    </div>
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