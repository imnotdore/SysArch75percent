import { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ScheduleForm.css";

export default function ScheduleForm() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  const [form, setForm] = useState({
    borrowDate: "",
    returnDate: "",
    timeFrom: "",
    timeTo: "",
    item: "",
    quantity: 1,
    reason: "",
    acceptPolicy: false,
  });

  const [items, setItems] = useState([]);
  const [itemAvailability, setItemAvailability] = useState([]);
  const [selectedBorrowDate, setSelectedBorrowDate] = useState(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState(null);
  const [maxAvailable, setMaxAvailable] = useState(1);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("borrow");
  const [selectedRange, setSelectedRange] = useState([]);
  
  // New states for step navigation
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  // ========== FUNCTIONS ==========
  
  // NEW: Fetch user data on component mount
  useEffect(() => {
    fetchItems();
  }, [API_URL]);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setItems(res.data.filter(item => item.available > 0));
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };


  useEffect(() => {
    if (!form.item) {
      setItemAvailability([]);
      setSelectedBorrowDate(null);
      setSelectedReturnDate(null);
      setSelectedRange([]);
      return;
    }

    const fetchAvailability = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/items/availability?item=${form.item}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        setItemAvailability(res.data.dates || []);
        const maxQty = res.data.max_quantity || 1;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const tomorrowISO = formatDate(tomorrow);
        const tomorrowAvailable = res.data.dates.find((d) => d.date === tomorrowISO)?.available ?? maxQty;

        setForm((prev) => ({
          ...prev,
          borrowDate: tomorrowISO,
          returnDate: tomorrowISO,
          quantity: Math.min(1, tomorrowAvailable),
        }));
        
        setSelectedBorrowDate(tomorrow);
        setSelectedReturnDate(tomorrow);
        setSelectedRange([tomorrow, tomorrow]);
        setMaxAvailable(tomorrowAvailable);
        generateTimesForSelectedDate(tomorrow, tomorrowAvailable);
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    };

    fetchAvailability();
  }, [form.item, API_URL]);

  const formatDate = (date) => {
  // Add null check
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return ''; // Return empty string or handle appropriately
  }
  
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date - tzOffset).toISOString().split("T")[0];
};

  const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString("en-PH", {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (date, time) => {
    return new Date(`${date}T${time}`).toLocaleString("en-PH", {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getDatesBetween = (start, end) => {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);
    
    while (current <= endDate) {
      dates.push(formatDate(new Date(current)));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleBorrowDateSelect = (date) => {
    const iso = formatDate(date);
    const dayAvailability = itemAvailability.find((a) => a.date === iso);
    const availableToday = dayAvailability?.available ?? 0;
    
    setSelectedBorrowDate(date);
    
    const newReturnDate = !selectedReturnDate || new Date(selectedReturnDate) < date ? date : selectedReturnDate;
    
    setForm((prev) => ({ 
      ...prev, 
      borrowDate: iso,
      returnDate: formatDate(newReturnDate)
    }));
    
    setSelectedReturnDate(newReturnDate);
    setSelectedRange([date, newReturnDate]);
    
    updateMaxAvailable(iso, formatDate(newReturnDate));
    generateTimesForSelectedDate(date, availableToday);
  };

  const handleReturnDateSelect = (date) => {
    if (!selectedBorrowDate) {
      alert("⚠️ Please select a borrow date first!");
      setCurrentView("borrow");
      return;
    }

    const iso = formatDate(date);
    
    if (date < selectedBorrowDate) {
      alert("⚠️ Return date cannot be before borrow date!");
      return;
    }
    
    setSelectedReturnDate(date);
    setForm((prev) => ({ ...prev, returnDate: iso }));
    setSelectedRange([selectedBorrowDate, date]);
    
    updateMaxAvailable(form.borrowDate, iso);
  };

  const updateMaxAvailable = (borrowDate, returnDate) => {
    if (!borrowDate || !returnDate) return;
    
    const datesToCheck = getDatesBetween(new Date(borrowDate), new Date(returnDate));
    const minAvailable = Math.min(
      ...datesToCheck.map(date => {
        const day = itemAvailability.find(a => a.date === date);
        return day?.available ?? 0;
      })
    );
    
    setMaxAvailable(minAvailable);
    setForm(prev => ({
      ...prev,
      quantity: Math.min(prev.quantity, minAvailable) || 1
    }));
  };

  const generateTimesForSelectedDate = (date, availableStock) => {
    const today = new Date();
    const selected = new Date(date);
    const isToday = selected.toDateString() === today.toDateString();
    const currentHour = today.getHours();
    
    const timeSlots = [];
    const startHour = 8;
    const endHour = 17;

    for (let hour = startHour; hour <= endHour; hour++) {
      if (isToday && hour <= currentHour) continue;
      if (hour === 12) continue;
      
      const displayHour = hour <= 12 ? hour : hour - 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const timeString = `${displayHour}:00 ${ampm}`;
      
      timeSlots.push(timeString);
    }

    setAvailableTimes(timeSlots);
    
    if (timeSlots.length > 0) {
      setForm(prev => ({
        ...prev,
        timeFrom: timeSlots[0],
        timeTo: timeSlots[Math.min(3, timeSlots.length - 1)]
      }));
    }
  };

  const checkAvailabilityForSelectedRange = () => {
    if (!form.borrowDate || !form.returnDate) return true;
    
    const datesToCheck = getDatesBetween(new Date(form.borrowDate), new Date(form.returnDate));
    return datesToCheck.every(date => {
      const day = itemAvailability.find(a => a.date === date);
      return day && day.available >= form.quantity;
    });
  };



  const handleSubmit = async () => {
    const { borrowDate, returnDate, timeFrom, timeTo, item, quantity, reason, acceptPolicy } = form;
    
    if (!borrowDate || !returnDate || !timeFrom || !timeTo || !item || !reason.trim()) {
      return alert("⚠️ Please fill out all required fields!");
    }
    
    if (!acceptPolicy) {
      return alert("⚠️ You must accept the borrowing policy!");
    }

    if (quantity < 1) {
      return alert("⚠️ Quantity must be at least 1!");
    }

    if (new Date(borrowDate) > new Date(returnDate)) {
      return alert("⚠️ Return date cannot be before borrow date!");
    }

    // In handleSubmit function, line 191-192, it should just show alert:
    if (!checkAvailabilityForSelectedRange()) {
    return alert("⚠️ Not enough items available for selected dates!");

      
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/schedules`,
        { 
          date_from: borrowDate, 
          date_to: returnDate, 
          time_from: timeFrom, 
          time_to: timeTo, 
          item, 
          quantity, 
          reason: reason.trim() 
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setSubmitted(true);
   
      fetchItems();
   
      
    } catch (err) {
      alert(err.response?.data?.error || "❌ Failed to submit borrowing request");
    } finally {
      setLoading(false);
    }
  };

const getTileClassName = ({ date, view }) => {
  if (view !== 'month') return '';
  
  // Check if date is valid
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  const iso = formatDate(date);
  const today = formatDate(new Date());
  
  // Check if iso is valid
  if (!iso) return '';
  
  const day = itemAvailability.find((a) => a.date === iso);
  
  if (iso < today) return 'past-date';
  if (!day || day.available <= 0) return 'unavailable-date';
  
  if (selectedBorrowDate && formatDate(selectedBorrowDate) === iso) return 'borrow-date';
  if (selectedReturnDate && formatDate(selectedReturnDate) === iso) return 'return-date';
  
  if (selectedRange.length === 2) {
    const start = formatDate(selectedRange[0]);
    const end = formatDate(selectedRange[1]);
    if (start && end && iso >= start && iso <= end) return 'selected-range';
  }
  
  return 'available-date';
};

 const isDateDisabled = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return true; // Disable invalid dates
  }
  
  const iso = formatDate(date);
  if (!iso) return true;
  
  const today = formatDate(new Date());
  const day = itemAvailability.find((a) => a.date === iso);
  return iso < today || !day || day.available <= 0;
};

  const getDurationDays = () => {
    if (!selectedBorrowDate || !selectedReturnDate) return 0;
    return Math.ceil((new Date(selectedReturnDate) - new Date(selectedBorrowDate)) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleTabSwitch = (tab) => {
    if (tab === "return" && !selectedBorrowDate) {
      alert("⚠️ Please select a borrow date first!");
      return;
    }
    setCurrentView(tab);
  };

  const getTabButtonClass = (tab) => {
    let className = "schedule-tab-button";
    if (currentView === tab) {
      className += " active";
    }
    if (tab === "return" && !selectedBorrowDate) {
      className += " disabled";
    }
    return className;
  };

  const nextStep = () => {
    if (currentStep === 1 && !form.item) {
      alert("⚠️ Please select an item first!");
      return;
    }
    if (currentStep === 1 && (!selectedBorrowDate || !selectedReturnDate)) {
      alert("⚠️ Please select both borrow and return dates!");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setForm({
      borrowDate: "",
      returnDate: "",
      timeFrom: "",
      timeTo: "",
      item: "",
      quantity: 1,
      reason: "",
      acceptPolicy: false,
    });
    setSelectedBorrowDate(null);
    setSelectedReturnDate(null);
    setSelectedRange([]);
    setItemAvailability([]);
    setCurrentStep(1);
    setSubmitted(false);
  };

 

  // ========== RENDER FUNCTIONS ==========

  

  // Step 1: Item and Date Selection (same as before but with waitlist option)
  const renderStep1 = () => (
    <div className="schedule-step-container">
      <div className="schedule-step-header">
        <div className="schedule-step-title">
          <span className="schedule-step-number">1</span>
          <h3>Select Item & Dates</h3>
        </div>
        <div className="schedule-step-nav">
          <span className="schedule-step-current">Step 1 of 3</span>
        </div>
      </div>

      <div className="schedule-form-columns">
        <div className="schedule-form-left">
          <div className="schedule-form-group">
            <label className="schedule-label">Select Item to Borrow *</label>
            <select 
              value={form.item} 
              onChange={(e) => {
                setForm({ ...form, item: e.target.value, quantity: 1 });
                setSelectedBorrowDate(null);
                setSelectedReturnDate(null);
                setSelectedRange([]);
              }} 
              className="schedule-select"
              required
            >
              <option value="">-- Choose an Item --</option>
              {items.map((item) => (
                <option key={item.id} value={item.item_name}>
                  {item.item_name} ({item.available} available)
                  
                </option>
              ))}
            </select>
            
            {items.length === 0 ? (
              <div className="schedule-warning-box">
                <span className="schedule-warning-icon">⚠️</span>
                No items available for borrowing at the moment.
              </div>
            ) : form.item && maxAvailable === 0 && (
              <div className="schedule-info-box">
                <span className="schedule-info-icon">⏳</span>
                This item is currently out of stock. 
              
              </div>
            )}
          </div>

          {form.item && maxAvailable > 0 && (
            <div className="schedule-form-group">
              <label className="schedule-label">Select Borrowing Period *</label>
              
              <div className="schedule-date-tabs">
                <button
                  type="button"
                  className={getTabButtonClass("borrow")}
                  onClick={() => setCurrentView("borrow")}
                >
                  <span className="schedule-tab-icon">📅</span>
                  Borrow Date
                </button>
                <button
                  type="button"
                  className={getTabButtonClass("return")}
                  onClick={() => handleTabSwitch("return")}
                  disabled={!selectedBorrowDate}
                >
                  <span className="schedule-tab-icon">📅</span>
                  Return Date
                  {!selectedBorrowDate && <span className="schedule-lock-icon">🔒</span>}
                </button>
              </div>

              <div className="schedule-calendar-container">
                <Calendar
                  minDate={new Date()}
                  onChange={currentView === "borrow" ? handleBorrowDateSelect : handleReturnDateSelect}
                  value={currentView === "borrow" ? selectedBorrowDate : selectedReturnDate}
                  tileClassName={getTileClassName}
                  tileDisabled={({ date, view }) => view === 'month' && isDateDisabled(date)}
                  showNeighboringMonth={false}
                />
              </div>
            </div>
          )}
        </div>

        <div className="schedule-form-right">
          {(selectedBorrowDate || selectedReturnDate) && (
            <div className="schedule-selection-info">
              <h4>Selected Dates</h4>
              <div className="schedule-date-cards">
                <div className="schedule-date-card">
                  <div className="schedule-date-card-header">
                    <span className="schedule-date-card-icon">⏰</span>
                    <strong>Borrow Date</strong>
                  </div>
                  <div className="schedule-date-card-value">
                    {selectedBorrowDate ? formatDisplayDate(selectedBorrowDate) : "Not selected"}
                  </div>
                </div>
                
                <div className="schedule-date-card">
                  <div className="schedule-date-card-header">
                    <span className="schedule-date-card-icon">🔄</span>
                    <strong>Return Date</strong>
                  </div>
                  <div className="schedule-date-card-value">
                    {selectedReturnDate ? formatDisplayDate(selectedReturnDate) : "Not selected"}
                  </div>
                </div>
              </div>
              
              <div className="schedule-stats-container">
                <div className="schedule-stat-item">
                  <span className="schedule-stat-label">Duration:</span>
                  <span className="schedule-stat-value">{getDurationDays()} days</span>
                </div>
                <div className="schedule-stat-item">
                  <span className="schedule-stat-label">Max Available:</span>
                  <span className="schedule-stat-value">{maxAvailable} items</span>
                </div>
              </div>
              
              {!checkAvailabilityForSelectedRange() && (
                <div className="schedule-warning-box">
                  <span className="schedule-warning-icon">⚠️</span>
                  Not enough items available for all selected dates
                  
                </div>
              )}
            </div>
          )}

          {!selectedBorrowDate && form.item && (
            <div className="schedule-info-box">
              <span className="schedule-info-icon">ℹ️</span>
              Please select a borrow date first before choosing a return date
            </div>
          )}

          <div className="schedule-step-actions">
            <button 
              className="schedule-next-button"
              onClick={nextStep}
              disabled={!form.item || !selectedBorrowDate || !selectedReturnDate}
            >
              Continue to Time Selection →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Time and Details (same as before)
  const renderStep2 = () => (
    <div className="schedule-step-container">
      <div className="schedule-step-header">
        <div className="schedule-step-title">
          <span className="schedule-step-number">2</span>
          <h3>Time & Details</h3>
        </div>
        <div className="schedule-step-nav">
          <span className="schedule-step-current">Step 2 of 3</span>
        </div>
      </div>

      <div className="schedule-form-columns">
        <div className="schedule-form-left">
          <div className="schedule-summary-box">
            <h4>📋 Current Selection</h4>
            <div className="schedule-summary-content">
              <div className="schedule-summary-item">
                <strong>Item:</strong> {form.item}
              </div>
              <div className="schedule-summary-item">
                <strong>Borrow Date:</strong> {formatDisplayDate(selectedBorrowDate)}
              </div>
              <div className="schedule-summary-item">
                <strong>Return Date:</strong> {formatDisplayDate(selectedReturnDate)}
              </div>
              <div className="schedule-summary-item">
                <strong>Duration:</strong> {getDurationDays()} days
              </div>
            </div>
          </div>

          <div className="schedule-form-group">
            <label className="schedule-label">
              ⏰ Borrowing Time on {formatDisplayDate(selectedBorrowDate)} *
            </label>
            <div className="schedule-time-group">
              <div className="schedule-time-input">
                <label className="schedule-time-label">From</label>
                <select
                  value={form.timeFrom}
                  onChange={(e) => setForm({ ...form, timeFrom: e.target.value })}
                  className="schedule-select"
                  required
                >
                  <option value="">Select start time</option>
                  {availableTimes.map((time) => (
                    <option key={`from-${time}`} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="schedule-time-input">
                <label className="schedule-time-label">To</label>
                <select
                  value={form.timeTo}
                  onChange={(e) => setForm({ ...form, timeTo: e.target.value })}
                  className="schedule-select"
                  required
                >
                  <option value="">Select end time</option>
                  {availableTimes
                    .filter(time => {
                      if (!form.timeFrom) return true;
                      const fromIndex = availableTimes.indexOf(form.timeFrom);
                      const toIndex = availableTimes.indexOf(time);
                      return toIndex > fromIndex;
                    })
                    .map((time) => (
                      <option key={`to-${time}`} value={time}>{time}</option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="schedule-info-box">
              <span className="schedule-info-icon">ℹ️</span>
              Office hours: 8:00 AM - 5:00 PM (excluding 12:00-1:00 PM lunch break)
            </div>
          </div>
        </div>

        <div className="schedule-form-right">
          <div className="schedule-form-group">
            <label className="schedule-label">📦 Quantity *</label>
            <div className="schedule-quantity-container">
              <input
                type="number"
                min="1"
                max={maxAvailable}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Math.max(1, Math.min(maxAvailable, Number(e.target.value))) })}
                className="schedule-input"
                disabled={maxAvailable === 0}
              />
              <div className="schedule-quantity-info">
                Maximum: <strong>{maxAvailable}</strong> items available
              </div>
            </div>
          </div>

          <div className="schedule-form-group">
            <label className="schedule-label">📝 Purpose / Reason for Borrowing *</label>
            <textarea 
              value={form.reason} 
              onChange={(e) => setForm({ ...form, reason: e.target.value })} 
              className="schedule-textarea"
              placeholder="Please describe what you'll use the item for (e.g., community event, personal project, etc.)..."
              rows="4"
              required
            />
          </div>

          <div className="schedule-step-actions">
            <button 
              className="schedule-back-button"
              onClick={prevStep}
            >
              ← Back to Dates
            </button>
            <button 
              className="schedule-next-button"
              onClick={nextStep}
              disabled={!form.timeFrom || !form.timeTo || !form.reason.trim()}
            >
              Continue to Review →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Policy and Submission (same as before)
  const renderStep3 = () => (
    <div className="schedule-step-container">
      <div className="schedule-step-header">
        <div className="schedule-step-title">
          <span className="schedule-step-number">3</span>
          <h3>Review & Submit</h3>
        </div>
        <div className="schedule-step-nav">
          <span className="schedule-step-current">Step 3 of 3</span>
        </div>
      </div>

      <div className="schedule-form-columns">
        <div className="schedule-form-left">
          <div className="schedule-final-summary">
            <h4>📋 Request Summary</h4>
            <div className="schedule-summary-grid">
              <div className="schedule-summary-item">
                <strong>Item:</strong>
                <span>{form.item}</span>
              </div>
              <div className="schedule-summary-item">
                <strong>Borrow Date:</strong>
                <span>{formatDisplayDate(selectedBorrowDate)}</span>
              </div>
              <div className="schedule-summary-item">
                <strong>Return Date:</strong>
                <span>{formatDisplayDate(selectedReturnDate)}</span>
              </div>
              <div className="schedule-summary-item">
                <strong>Time:</strong>
                <span>{form.timeFrom} - {form.timeTo}</span>
              </div>
              <div className="schedule-summary-item">
                <strong>Quantity:</strong>
                <span>{form.quantity}</span>
              </div>
              <div className="schedule-summary-item">
                <strong>Purpose:</strong>
                <span>{form.reason}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="schedule-form-right">
          <div className="schedule-policy-group">
            <div className="schedule-policy-header">
              <h4>📋 Borrowing Policy Agreement</h4>
              <button 
                type="button" 
                className="schedule-policy-read-button"
                onClick={() => setShowPolicy(!showPolicy)}
              >
                {showPolicy ? "▲ Hide Policy" : "▼ Read Policy First"}
              </button>
            </div>

            {showPolicy && (
              <div className="schedule-policy-content">
                <div className="schedule-policy-section">
                  <h5>📝 Terms and Conditions:</h5>
                  <ul>
                    <li>✅ I am fully responsible for the borrowed item during the borrowing period</li>
                    <li>✅ I agree to return the item in the same condition as when borrowed</li>
                    <li>✅ I will cover any repair costs for damages caused by misuse or negligence</li>
                    <li>✅ I agree to replace the item if it gets lost or damaged beyond repair</li>
                    <li>✅ I understand that late returns may affect my future borrowing privileges</li>
                    <li>✅ I will use the item only for its intended purpose as stated in my reason</li>
                    <li>✅ I agree to follow all safety guidelines and instructions for the item</li>
                    <li>✅ I understand that the borrowing period cannot be extended without prior approval</li>
                  </ul>
                </div>
                
                <div className="schedule-policy-section">
                  <h5>⚠️ Important Notes:</h5>
                  <ul>
                    <li>• Borrowing requests are subject to approval</li>
                    <li>• You will be notified via email about the status of your request</li>
                    <li>• Please inspect the item before leaving the premises</li>
                    <li>• Report any issues immediately to the equipment manager</li>
                  </ul>
                </div>
              </div>
            )}

            <label className="schedule-policy-label">
              <input
                type="checkbox"
                checked={form.acceptPolicy}
                onChange={(e) => setForm({ ...form, acceptPolicy: e.target.checked })}
                className="schedule-checkbox"
                required
                disabled={!showPolicy}
              />
              <span className="schedule-policy-text">
                ✅ I have read and understood the borrowing policy above and agree to all terms and conditions.
                {!showPolicy && (
                  <span className="schedule-policy-note">
                    {" "}(Please read the policy first)
                  </span>
                )}
              </span>
            </label>
          </div>

          <div className="schedule-step-actions">
            <button 
              className="schedule-back-button"
              onClick={prevStep}
            >
              ← Back to Details
            </button>
            <button 
              onClick={handleSubmit} 
              className="schedule-submit-button"
              disabled={loading || !form.acceptPolicy}
            >
              {loading ? (
                <>
                  <span className="schedule-loading-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="schedule-submit-icon">📨</span>
                  Submit Borrowing Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Success Screen
  const renderSuccess = () => (
    <div className="schedule-success-container">
      <div className="schedule-success-content">
        <div className="schedule-success-icon">✅</div>
        <h2>Request Submitted Successfully!</h2>
        <div className="schedule-success-message">
          <p>Your borrowing request has been submitted and is now <strong>waiting for approval</strong>.</p>
          
          <div className="schedule-success-details">
            <h4>Request Details:</h4>
            <div className="schedule-summary-grid">
              <div className="schedule-summary-item">
                <strong>Item:</strong>
                <span>{form.item}</span>
              </div>
              <div className="schedule-summary-item">
                <strong>Period:</strong>
                <span>
                  {formatDisplayDate(selectedBorrowDate)} to {formatDisplayDate(selectedReturnDate)}
                </span>
              </div>
              <div className="schedule-summary-item">
                <strong>Time:</strong>
                <span>{form.timeFrom} - {form.timeTo}</span>
              </div>
              <div className="schedule-summary-item">
                <strong>Reference ID:</strong>
                <span>#{Date.now().toString().slice(-6)}</span>
              </div>
            </div>
          </div>

          <div className="schedule-next-steps">
            <h4>📋 What happens next?</h4>
            <ol>
              <li>Your request will be reviewed by the equipment manager</li>
              <li>You will receive an email notification once approved</li>
              <li>Pick up the item on the scheduled date and time</li>
              <li>Return the item in the same condition</li>
            </ol>
          </div>
        </div>

        <button 
          className="schedule-new-request-button"
          onClick={resetForm}
        >
          📅 Make Another Borrowing Request
        </button>
      </div>
    </div>
  );

  return (
    <section className="schedule-form-container">
      <h2 className="schedule-form-title">📅 Borrowing System Dashboard</h2>
      
   

     {submitted ? renderSuccess() : (
      <>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </>
    )}
    </section>
  );
}