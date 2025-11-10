import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";

export default function ComputerBorrowingForm() {
  const [form, setForm] = useState({
    pc: "",
    date: "",
    startTime: "",
    endTime: ""
  });
  const [endTimeOptions, setEndTimeOptions] = useState([]);
  const [error, setError] = useState("");

  const pcs = ["PC 1", "PC 2", "PC 3", "PC 4", "PC 5"];

  useEffect(() => {
    if (!form.startTime) {
      setEndTimeOptions([]);
      setForm(prev => ({ ...prev, endTime: "" }));
      return;
    }

    const [startHour, startMinute] = form.startTime.split(":").map(Number);
    const options = [];
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    for (let i = 30; i <= 120; i += 30) {
      const endDate = new Date(startDate.getTime() + i * 60 * 1000);
      const hours = endDate.getHours();
      const minutes = endDate.getMinutes();

      if (hours > 22 || (hours === 22 && minutes > 0)) break;

      const hStr = hours.toString().padStart(2, "0");
      const mStr = minutes.toString().padStart(2, "0");
      options.push(`${hStr}:${mStr}`);
    }

    setEndTimeOptions(options);
    setForm(prev => ({ ...prev, endTime: options[0] || "" }));
  }, [form.startTime]);

  const handleSubmit = async () => {
    const { pc, date, startTime, endTime } = form;
    
    if (!pc || !date || !startTime || !endTime) {
      setError("Please fill out all fields.");
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const diffHours = (end - start) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      setError("End time must be after start time.");
      return;
    }
    
    if (diffHours > 2) {
      setError("You can borrow a PC for a maximum of 2 hours.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/computer-borrow`,
        { pc, date, startTime, endTime },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      alert(`Request submitted!\nPC: ${pc}\nDate: ${date}\nTime: ${startTime} - ${endTime}`);
      setForm({ pc: "", date: "", startTime: "", endTime: "" });
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request");
    }
  };

  return (
    <section style={styles.formSection}>
      <h2 style={styles.title}>Computer Borrowing Request</h2>
      
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.formGroup}>
        <label style={styles.label}>Choose PC:</label>
        <select 
          value={form.pc} 
          onChange={(e) => setForm({ ...form, pc: e.target.value })} 
          style={styles.select}
        >
          <option value="">-- Select PC --</option>
          {pcs.map((pc) => (
            <option key={pc} value={pc}>{pc}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Date:</label>
        <input 
          type="date" 
          value={form.date} 
          onChange={(e) => setForm({ ...form, date: e.target.value })} 
          style={styles.input}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Start Time (08:00–22:00):</label>
        <input 
          type="time" 
          value={form.startTime} 
          onChange={(e) => setForm({ ...form, startTime: e.target.value })} 
          style={styles.input}
          min="08:00" 
          max="22:00"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>End Time (Max 2 hours, 30-min steps):</label>
        <select 
          value={form.endTime} 
          onChange={(e) => setForm({ ...form, endTime: e.target.value })} 
          style={styles.select}
        >
          {endTimeOptions.length === 0 ? (
            <option value="">-- Select start time first --</option>
          ) : (
            endTimeOptions.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))
          )}
        </select>
      </div>

      <button onClick={handleSubmit} style={styles.submitButton}>
        Submit Request
      </button>
    </section>
  );
}

const styles = {
  formSection: {
    maxWidth: "500px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#28D69F",
    textAlign: "center",
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  select: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  error: {
    color: "red",
    marginBottom: "15px",
    textAlign: "center",
  },
  submitButton: {
    padding: "10px 15px",
    backgroundColor: "#28D69F",
    color: "white",
    fontWeight: "bold",
    width: "100%",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};