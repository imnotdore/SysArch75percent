import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { useNavigate } from "react-router-dom"; // Add this import
import "../styles/ComputerBorrowingForm.css";

// Icons
import { 
  Monitor, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle,
  CalendarDays,
  Clock3,
  AlertTriangle,
  Info,
  CalendarCheck
} from "lucide-react";

export default function ComputerBorrowingForm() {
  const navigate = useNavigate(); // Add this
  const [form, setForm] = useState({
    pc: "",
    date: "",
    startTime: "",
    endTime: ""
  });
  const [endTimeOptions, setEndTimeOptions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duration, setDuration] = useState(0);

  const pcs = [
    { id: "pc1", name: "PC 1", status: "Available" },
    { id: "pc2", name: "PC 2", status: "Available" },
    { id: "pc3", name: "PC 3", status: "Available" }
  ];

  // Generate time options from 8:00 AM to 5:00 PM in 30-minute increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip 5:30 PM
        if (hour === 17 && minute === 30) continue;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    if (!form.startTime) {
      setEndTimeOptions([]);
      setForm(prev => ({ ...prev, endTime: "" }));
      setDuration(0);
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

      // Only allow times up to 5:00 PM
      if (hours > 17 || (hours === 17 && minutes > 0)) break;

      const hStr = hours.toString().padStart(2, "0");
      const mStr = minutes.toString().padStart(2, "0");
      options.push(`${hStr}:${mStr}`);
    }

    setEndTimeOptions(options);
    if (options.length > 0 && !options.includes(form.endTime)) {
      setForm(prev => ({ ...prev, endTime: options[0] || "" }));
    }
  }, [form.startTime]);

  useEffect(() => {
    if (form.startTime && form.endTime) {
      const [startHour, startMinute] = form.startTime.split(":").map(Number);
      const [endHour, endMinute] = form.endTime.split(":").map(Number);
      const diffMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      setDuration(diffMinutes / 60);
    }
  }, [form.startTime, form.endTime]);

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

    // Check if time is within 8AM-5PM
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    
    if (startHour < 8 || startHour > 17 || endHour < 8 || endHour > 17) {
      setError("Operating hours are from 8:00 AM to 5:00 PM only.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await axios.post(
        `${API_URL}/api/computer-borrow`,
        { pc, date, startTime, endTime },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setSuccess(true);
      setForm({ pc: "", date: "", startTime: "", endTime: "" });
      
      // Redirect to Your Account after 1.5 seconds
      setTimeout(() => {
        navigate("/resident/youraccount"); // Add this line
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDurationDisplay = () => {
    if (duration <= 0) return "";
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (hours === 0) return `${minutes} minutes`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
  };

  const formatTimeDisplay = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="computer-borrowing-container">
      <div className="borrowing-card">
        {/* Header */}
        <div className="borrowing-header">
          <div className="header-icon">
            <Monitor size={32} />
          </div>
          <div className="header-content">
            <h2 className="header-title">Computer Borrowing Request</h2>
            <p className="header-subtitle">Reserve a computer station for your work during office hours (8AM-5PM)</p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="error-alert">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-alert">
            <CheckCircle size={20} />
            <span>Request submitted successfully! Redirecting to Your Account...</span>
          </div>
        )}

        {/* Form Content */}
        <div className="borrowing-form">
          {/* PC Selection */}
          <div className="form-group">
            <label className="form-label">
              <Monitor size={20} />
              <span>Computer Station</span>
            </label>
            <div className="pc-grid">
              {pcs.map((pc) => (
                <button
                  key={pc.id}
                  className={`pc-option ${form.pc === pc.name ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, pc: pc.name })}
                  type="button"
                >
                  <div className="pc-icon">🖥️</div>
                  <div className="pc-info">
                    <span className="pc-name">{pc.name}</span>
                    <span className="pc-status">{pc.status}</span>
                  </div>
                  {form.pc === pc.name && <div className="pc-check">✓</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time Section */}
          <div className="datetime-section">
            <div className="section-header">
              <CalendarDays size={24} />
              <h3>Select Date & Time</h3>
            </div>

            <div className="datetime-grid">
              {/* Date Selection */}
              <div className="form-group">
                <label className="form-label">Date</label>
                <div className="date-input-wrapper">
                  <Calendar size={20} className="input-icon" />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="date-input"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {form.date && (
                  <div className="date-preview">
                    <CalendarCheck size={16} />
                    {formatDate(form.date)}
                  </div>
                )}
              </div>

              {/* Time Selection */}
              <div className="time-selection">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <div className="time-input-wrapper">
                    <Clock size={20} className="input-icon" />
                    <select
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="time-select"
                    >
                      <option value="">Select start time</option>
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {formatTimeDisplay(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="time-arrow">
                  <ChevronRight size={24} />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <div className="time-input-wrapper">
                    <Clock3 size={20} className="input-icon" />
                    <select
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="time-select"
                      disabled={!form.startTime}
                    >
                      <option value="">Select end time</option>
                      {endTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {formatTimeDisplay(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Display */}
            {duration > 0 && (
              <div className="duration-display">
                <div className="duration-card">
                  <div className="duration-icon">⏱️</div>
                  <div className="duration-info">
                    <span className="duration-label">Reservation Duration</span>
                    <span className="duration-value">{calculateDurationDisplay()}</span>
                  </div>
                  <div className={`duration-status ${duration <= 2 ? 'valid' : 'invalid'}`}>
                    {duration <= 2 ? '✓ Within Limit' : '✗ Exceeds Limit'}
                  </div>
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="guidelines">
              <h4>
                <Info size={20} />
                Reservation Guidelines
              </h4>
              <div className="guideline-item">
                <div className="guideline-icon">⏰</div>
                <span>Operating hours: 8:00 AM - 5:00 PM only</span>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">⏱️</div>
                <span>Maximum duration: 2 hours per session</span>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">📅</div>
                <span>Select date first, then choose your preferred time slot</span>
              </div>
              <div className="guideline-item">
                <div className="guideline-icon">⚠️</div>
                <span>End time options are automatically limited to 2 hours from start time</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit} 
            className="submit-button"
            disabled={loading || !form.pc || !form.date || !form.startTime || !form.endTime}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              <>
                Submit Reservation Request
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}