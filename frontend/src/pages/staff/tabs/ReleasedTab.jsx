import { useState } from "react";
import { FaUndo } from "react-icons/fa";

export default function ReleasedTab({ releasedSchedules, onReturnSchedule }) {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [returnCondition, setReturnCondition] = useState("good");
  const [damageDescription, setDamageDescription] = useState("");
  const [damageCost, setDamageCost] = useState("");

  const handleReturn = async (schedule) => {
    if (returnCondition !== "good" && !damageDescription.trim()) {
      alert("Please provide damage description for damaged/missing items");
      return;
    }

    const returnData = {
      condition: returnCondition,
      damage_description: returnCondition !== "good" ? damageDescription : null,
      damage_cost: returnCondition !== "good" ? parseFloat(damageCost) || 0 : null
    };

    if (await onReturnSchedule(schedule.id, returnData)) {
      setSelectedSchedule(null);
      setReturnCondition("good");
      setDamageDescription("");
      setDamageCost("");
    }
  };

  return (
    <section className="released-list">
      <h2>Released Items - Awaiting Return</h2>
      
      {releasedSchedules.length === 0 ? (
        <p>No released items awaiting return.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Borrow Period</th>
              <th>Released By</th>
              <th>Date Released</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {releasedSchedules.map((s) => (
              <tr key={`released-${s.id}`}>
                <td>{s.resident_username || `Resident#${s.user_id}`}</td>
                <td>{s.item}</td>
                <td>{s.quantity}</td>
                <td>
                  {new Date(s.date_from).toLocaleDateString()} to {" "}
                  {new Date(s.date_to).toLocaleDateString()}
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
                <td>
                  <button 
                    className="btn-warning"
                    onClick={() => setSelectedSchedule(s)}
                  >
                    <FaUndo /> Mark Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Return Modal */}
      {selectedSchedule && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Mark Item as Returned</h3>
            <div className="modal-body">
              <p><strong>Item:</strong> {selectedSchedule.item}</p>
              <p><strong>Resident:</strong> {selectedSchedule.resident_username}</p>
              <p><strong>Quantity:</strong> {selectedSchedule.quantity}</p>
              
              <div className="form-group">
                <label>Return Condition:</label>
                <select 
                  value={returnCondition} 
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="form-select"
                >
                  <option value="good">Good Condition</option>
                  <option value="damaged">Damaged</option>
                  <option value="missing">Missing</option>
                </select>
              </div>

              {returnCondition !== "good" && (
                <>
                  <div className="form-group">
                    <label>Damage/Missing Description:</label>
                    <textarea
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                      placeholder="Describe the damage or reason for missing..."
                      className="form-textarea"
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Repair/Replacement Cost (PHP):</label>
                    <input
                      type="number"
                      value={damageCost}
                      onChange={(e) => setDamageCost(e.target.value)}
                      placeholder="0.00"
                      className="form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedSchedule(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleReturn(selectedSchedule)}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}