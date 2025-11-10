import { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { API_URL } from "../../../config";

export default function ScheduleForm() {
  const [form, setForm] = useState({
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
    item: "",
    quantity: 1,
    reason: "",
    acceptPolicy: false,
  });

  const [items, setItems] = useState([]);
  const [itemAvailability, setItemAvailability] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [maxAvailable, setMaxAvailable] = useState(1);
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/items`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (!form.item) return setItemAvailability([]);

    const fetchAvailability = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/items/availability?item=${form.item}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setItemAvailability(res.data.dates || []);
        const maxQty = res.data.max_quantity || 1;
        setMaxAvailable(maxQty);

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const todayISO = formatDate(today);
        const tomorrowISO = formatDate(tomorrow);

        const todayAvailable = res.data.dates.find((d) => d.date === todayISO)?.available ?? maxQty;
        const tomorrowAvailable = res.data.dates.find((d) => d.date === tomorrowISO)?.available ?? maxQty;
        const minAvailable = Math.min(todayAvailable, tomorrowAvailable);

        setForm((prev) => ({
          ...prev,
          dateFrom: todayISO,
          dateTo: tomorrowISO,
          quantity: minAvailable > 0 ? 1 : 0,
        }));
        setSelectedDates([today, tomorrow]);
        setMaxAvailable(minAvailable);
        generateTimesForSelectedDate(today, minAvailable);
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    };

    fetchAvailability();
  }, [form.item]);

  const formatDate = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date - tzOffset).toISOString().split("T")[0];
  };

  const getDatesBetween = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const dates = [];
    while (s <= e) {
      dates.push(formatDate(s));
      s.setDate(s.getDate() + 1);
    }
    return dates;
  };

  const handleSelectDate = (date) => {
    const iso = formatDate(date);
    const dayAvailable = itemAvailability.find((a) => a.date === iso)?.available ?? 1;
    setSelectedDates([date]);
    setForm((prev) => ({ ...prev, dateFrom: iso, dateTo: iso, quantity: dayAvailable > 0 ? 1 : 0 }));
    setMaxAvailable(dayAvailable);
    generateTimesForSelectedDate(date, dayAvailable);
  };

  const generateTimesForSelectedDate = (date, availableStock) => {
    const today = new Date();
    const selected = new Date(date);
    const slots = [];
    const isToday = selected.toDateString() === today.toDateString();

    const periods = [
      { label: "Morning", start: 8, end: 12 },
      { label: "Afternoon", start: 13, end: 17 },
    ];

    periods.forEach((p) => {
      for (let h = p.start; h <= p.end; h++) {
        if (isToday && h <= today.getHours()) continue;
        if (availableStock < form.quantity) continue;
        const displayHour = h <= 12 ? h : h - 12;
        const ampm = h < 12 ? "AM" : "PM";
        slots.push(`${displayHour}:00 ${ampm}`);
      }
    });

    setAvailableTimes(slots);
    setForm((prev) => ({ ...prev, timeFrom: slots[0] || "", timeTo: slots[slots.length - 1] || "" }));
  };

  const handleSubmit = async () => {
    const { dateFrom, dateTo, timeFrom, timeTo, item, quantity, reason, acceptPolicy } = form;
    
    if (!dateFrom || !dateTo || !timeFrom || !timeTo || !item) {
      return alert("⚠️ Please fill out all fields!");
    }
    
    if (!acceptPolicy) {
      return alert("⚠️ You must accept the policy before submitting the schedule!");
    }

    const datesToBook = getDatesBetween(dateFrom, dateTo);
    const insufficient = datesToBook.some((date) => {
      const day = itemAvailability.find((a) => a.date === date);
      return !day || day.available < quantity;
    });
    
    if (insufficient) return alert("⚠️ Not enough items available for selected dates");

    try {
      await axios.post(
        `${API_URL}/api/schedules`,
        { date_from: dateFrom, date_to: dateTo, time_from: timeFrom, time_to: timeTo, item, quantity, reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("✅ Booking request submitted!");
      setSelectedDates([]);
      setForm({ dateFrom: "", dateTo: "", timeFrom: "", timeTo: "", item: "", quantity: 1, reason: "", acceptPolicy: false });
    } catch (err) {
      alert(err.response?.data?.error || "❌ Failed to submit booking");
    }
  };

  return (
    <section style={styles.formSection}>
      <h2 style={styles.formTitle}>Submit Schedule</h2>

      {/* Item Selection */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Item</label>
        <select 
          value={form.item} 
          onChange={(e) => setForm({ ...form, item: e.target.value })} 
          style={styles.select}
        >
          <option value="">-- Select Item --</option>
          {items.map((item) => (
            <option key={item.id} value={item.item_name} disabled={item.available <= 0}>
              {item.item_name} {item.available <= 0 ? "(Fully booked)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar */}
      {form.item && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Select Date Range</label>
          <Calendar
            minDate={new Date()}
            value={selectedDates}
            tileDisabled={({ date }) => {
              const iso = formatDate(date);
              const today = formatDate(new Date());
              const day = itemAvailability.find((a) => a.date === iso);
              if (iso < today) return true;
              if (!day || day.available <= 0) return true;
              return false;
            }}
            onClickDay={handleSelectDate}
          />
          {selectedDates.length > 0 && (
            <p style={styles.selectedDates}>
              Selected Dates: <strong>{selectedDates.map((d) => formatDate(d)).join(", ")}</strong>
            </p>
          )}
        </div>
      )}

      {/* Time Selection */}
      {selectedDates.length > 0 && (
        <div style={styles.timeGroup}>
          <div style={styles.timeInput}>
            <label style={styles.label}>Start Time</label>
            <select
              value={form.timeFrom}
              onChange={(e) => setForm({ ...form, timeFrom: e.target.value })}
              style={styles.select}
            >
              {availableTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div style={styles.timeInput}>
            <label style={styles.label}>End Time</label>
            <select
              value={form.timeTo}
              onChange={(e) => setForm({ ...form, timeTo: e.target.value })}
              style={styles.select}
            >
              {availableTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Reason */}
      {selectedDates.length > 0 && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Reason for Borrowing</label>
          <textarea 
            value={form.reason} 
            onChange={(e) => setForm({ ...form, reason: e.target.value })} 
            style={styles.textarea}
            placeholder="Enter your reason..."
          />
        </div>
      )}

      {/* Policy Agreement */}
      {selectedDates.length > 0 && (
        <div style={styles.policyGroup}>
          <input
            type="checkbox"
            checked={form.acceptPolicy}
            onChange={(e) => setForm({ ...form, acceptPolicy: e.target.checked })}
            style={styles.checkbox}
          />
          <span style={styles.policyText}>
            I acknowledge that I am fully responsible for any damage or loss of the borrowed item. 
            Any costs to repair or replace the item will be charged based on the actual damage value.
            I agree to comply with this policy.
          </span>
        </div>
      )}

      {/* Quantity */}
      {selectedDates.length > 0 && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Quantity</label>
          <input
            type="number"
            min="0"
            max={maxAvailable}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            style={styles.input}
            disabled={maxAvailable === 0}
          />
          {maxAvailable === 0 && (
            <p style={styles.warning}>⚠️ No items available for the selected date.</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      {selectedDates.length > 0 && (
        <button onClick={handleSubmit} style={styles.submitButton}>
          Submit Schedule
        </button>
      )}
    </section>
  );
}

const styles = {
  formSection: {
    marginBottom: "30px",
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  formTitle: {
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
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "80px",
    resize: "vertical",
  },
  timeGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  timeInput: {
    flex: 1,
  },
  selectedDates: {
    marginTop: "5px",
    fontSize: "14px",
  },
  policyGroup: {
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "#FFF3CD",
    border: "1px solid #FFEEBA",
    borderRadius: "6px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  checkbox: {
    marginTop: "3px",
  },
  policyText: {
    fontSize: "14px",
    lineHeight: "1.4",
  },
  warning: {
    fontSize: "12px",
    color: "red",
    marginTop: "5px",
  },
  submitButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28D69F",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
  },
};