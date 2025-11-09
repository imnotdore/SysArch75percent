export default function ReleasedTab({ releasedSchedules }) {
  return (
    <section className="released-list">
      <h2>Released Items</h2>
      {releasedSchedules.length === 0 ? (
        <p>No released schedules yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Approved By</th>
              <th>Date Approved</th>
              <th>Released By</th>
              <th>Date Released</th>
            </tr>
          </thead>
          <tbody>
            {releasedSchedules.map((s) => (
              <tr key={`released-${s.id}`}>
                <td>{s.resident_username || `Resident#${s.user_id}`}</td>
                <td>{s.item}</td>
                <td>{s.quantity}</td>
                <td>{s.staff_username}</td>
                <td>
                  {s.approved_at
                    ? new Date(s.approved_at).toLocaleString("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "N/A"}
                </td>
                <td>{s.released_by_username}</td>
                <td>
                  {s.released_at
                    ? new Date(s.released_at).toLocaleString("en-PH", {
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
    </section>
  );
}