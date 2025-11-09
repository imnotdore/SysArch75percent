export default function ReturnedTab({ returnedSchedules }) {
  return (
    <section className="returned-list">
      <h2>Returned Items</h2>
      {returnedSchedules.length === 0 ? (
        <p>No returned items.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Returned By</th>
              <th>Date Returned</th>
            </tr>
          </thead>
          <tbody>
            {returnedSchedules.map((s) => (
              <tr key={`returned-${s.id}`}>
                <td>{s.resident_username || `Resident#${s.user_id}`}</td>
                <td>{s.item}</td>
                <td>{s.quantity}</td>
                <td>{s.staff_username}</td>
                <td>
                  {s.returned_at
                    ? new Date(s.returned_at).toLocaleString("en-PH", {
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