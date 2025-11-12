import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function RequestForm() {
  const [form, setForm] = useState({
    purpose: "",
    dateNeeded: "",
    specialInstructions: ""
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState({});
  const [pageCount, setPageCount] = useState(0);
  const [countingPages, setCountingPages] = useState(false);
  const [allDatesAvailability, setAllDatesAvailability] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: File, 2: Purpose, 3: Date
  const fileInputRef = useRef(null);

  // Fix timezone issue - convert to local date string
  const formatDateToLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Adjust for timezone offset to get the correct local date
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  // Fix for getting today's date in local timezone
  const getTodayLocal = () => {
    const today = new Date();
    return formatDateToLocal(today);
  };

  // Fetch all dates availability on component mount
  useEffect(() => {
    fetchAllDatesAvailability();
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    if (form.dateNeeded) {
      checkAvailability(form.dateNeeded);
    }
  }, [form.dateNeeded]);

  // Auto-advance to next step when requirements are met
  useEffect(() => {
    if (currentStep === 1 && file && pageCount > 0) {
      setCurrentStep(2);
    }
    if (currentStep === 2 && form.purpose) {
      setCurrentStep(3);
    }
  }, [file, pageCount, form.purpose, currentStep]);

  const fetchAllDatesAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/files/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllDatesAvailability(response.data.dates || []);
    } catch (error) {
      console.error("Error fetching all dates availability:", error);
    }
  };

  const checkAvailability = async (date) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/files/availability/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailability(response.data);
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  };

  // Function to count pages from PDF
  const countPDFPages = (file) => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      
      fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        
        // PDF.js for page counting
        if (window.pdfjsLib) {
          const loadingTask = pdfjsLib.getDocument(typedarray);
          loadingTask.promise.then(pdf => {
            resolve(pdf.numPages);
          }).catch(() => {
            // If PDF.js fails, estimate based on file size
            const estimatedPages = Math.max(1, Math.ceil(file.size / 50000));
            resolve(estimatedPages);
          });
        } else {
          // Fallback estimation
          const estimatedPages = Math.max(1, Math.ceil(file.size / 50000));
          resolve(estimatedPages);
        }
      };
      
      fileReader.readAsArrayBuffer(file);
    });
  };

  // Function to count pages from Word documents (estimation)
  const countWordPages = (file) => {
    // Estimate based on file size for Word documents
    const estimatedPages = Math.max(1, Math.ceil(file.size / 30000));
    return Promise.resolve(estimatedPages);
  };

  // Function to count pages from images
  const countImagePages = (file) => {
    // Each image counts as 1 page
    return Promise.resolve(1);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only PDF, Word documents, JPEG, and PNG files are allowed");
        return;
      }
      
      setFile(selectedFile);
      setError("");
      setCountingPages(true);

      try {
        let pages = 1;
        
        // Count pages based on file type
        if (selectedFile.type === 'application/pdf') {
          pages = await countPDFPages(selectedFile);
        } else if (selectedFile.type.includes('word') || 
                   selectedFile.type.includes('document')) {
          pages = await countWordPages(selectedFile);
        } else if (selectedFile.type.includes('image')) {
          pages = await countImagePages(selectedFile);
        }
        
        setPageCount(pages);
        
      } catch (err) {
        console.error("Error counting pages:", err);
        setPageCount(1);
      } finally {
        setCountingPages(false);
      }
    }
  };

  const handlePurposeChange = (e) => {
    setForm(prev => ({ ...prev, purpose: e.target.value }));
  };

  const handleDateSelect = (date) => {
    // Fix: Use the correct date without timezone issues
    const selectedDate = formatDateToLocal(date);
    console.log("Selected date:", selectedDate, "Raw date:", date);
    setForm(prev => ({ ...prev, dateNeeded: selectedDate }));
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepForward = () => {
    if (currentStep === 1 && file && pageCount > 0) {
      setCurrentStep(2);
    } else if (currentStep === 2 && form.purpose) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Final validation
    if (!file) {
      setError("Please select a file");
      setCurrentStep(1);
      return;
    }
    
    if (!form.purpose) {
      setError("Please select a purpose");
      setCurrentStep(2);
      return;
    }
    
    if (!form.dateNeeded) {
      setError("Please select a date needed");
      setCurrentStep(3);
      return;
    }

    if (pageCount === 0) {
      setError("Please wait for page counting to complete");
      setCurrentStep(1);
      return;
    }

    // Check if page count exceeds limits
    if (pageCount > 30) {
      setError(`❌ Single file cannot exceed 30 pages. Your file has ${pageCount} pages.`);
      return;
    }

    if (pageCount > availability.residentSlotsLeft) {
      setError(`❌ You can only upload ${availability.residentSlotsLeft} more pages for this date. Your file requires ${pageCount} pages.`);
      return;
    }

    if (pageCount > availability.slotsLeft) {
      setError(`❌ Only ${availability.slotsLeft} pages left available in the system for this date. Your file requires ${pageCount} pages.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", form.purpose);
    formData.append("dateNeeded", form.dateNeeded);
    formData.append("pageCount", pageCount.toString());
    formData.append("specialInstructions", form.specialInstructions);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });
      
      console.log("Upload response:", response.data);
      
      alert(`File uploaded successfully! Total pages: ${pageCount}`);
      
      // Reset form
      setForm({ 
        purpose: "", 
        dateNeeded: "", 
        specialInstructions: "" 
      });
      setFile(null);
      setPageCount(0);
      setAvailability({});
      setError("");
      setCurrentStep(1);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh availability data
      fetchAllDatesAvailability();
      
    } catch (error) {
      console.error("Upload error:", error);
      
      if (error.response) {
        setError(error.response.data.error || `Upload failed: ${error.response.status}`);
      } else if (error.request) {
        setError("Network error: Please check your connection");
      } else {
        setError("Upload failed: " + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  // Calendar tile className function for color coding
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = formatDateToLocal(date);
    const today = getTodayLocal();
    
    // Skip past dates
    if (dateStr < today) return 'past-date';
    
    const dateAvailability = allDatesAvailability.find(d => d.date_needed === dateStr);
    
    if (!dateAvailability) return 'available-date';
    
    const slotsLeft = dateAvailability.slotsLeft;
    
    // Color coding based on available pages
    if (slotsLeft <= 0) {
      return 'fully-booked-date';
    } else if (slotsLeft <= 10) {
      return 'low-availability-date';
    } else if (slotsLeft <= 30) {
      return 'medium-availability-date';
    } else {
      return 'available-date';
    }
  };

  // Calendar tile content to show available pages
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = formatDateToLocal(date);
    const today = getTodayLocal();
    
    if (dateStr < today) return null;
    
    const dateAvailability = allDatesAvailability.find(d => d.date_needed === dateStr);
    
    if (dateAvailability) {
      return (
        <div style={styles.calendarTileContent}>
          <div style={styles.availablePages}>
            {dateAvailability.slotsLeft}
          </div>
        </div>
      );
    }
    
    return (
      <div style={styles.calendarTileContent}>
        <div style={styles.availablePages}>
          
        </div>
      </div>
    );
  };

  // Fix for calendar value - convert back to Date object
  const getCalendarValue = () => {
    if (!form.dateNeeded) return null;
    // Convert the YYYY-MM-DD string back to Date object for calendar
    const [year, month, day] = form.dateNeeded.split('-');
    return new Date(year, month - 1, day);
  };

  return (
    <section style={styles.formSection}>
      <h2 style={styles.title}>File Upload Request</h2>
      
      {/* Progress Steps */}
      <div style={styles.progressContainer}>
        <div style={styles.progressSteps}>
          <div style={{
            ...styles.step, 
            ...(currentStep >= 1 ? styles.activeStep : styles.inactiveStep)
          }}>
            <div style={{
              ...styles.stepNumber,
              backgroundColor: currentStep >= 1 ? '#28D69F' : '#E5E7EB',
              color: currentStep >= 1 ? 'white' : '#6B7280'
            }}>
              1
            </div>
            <span style={{
              ...styles.stepLabel,
              color: currentStep >= 1 ? '#28D69F' : '#6B7280',
              fontWeight: currentStep >= 1 ? '600' : '400'
            }}>
              Upload File
            </span>
          </div>
          <div style={styles.stepConnector}></div>
          <div style={{
            ...styles.step, 
            ...(currentStep >= 2 ? styles.activeStep : styles.inactiveStep)
          }}>
            <div style={{
              ...styles.stepNumber,
              backgroundColor: currentStep >= 2 ? '#28D69F' : '#E5E7EB',
              color: currentStep >= 2 ? 'white' : '#6B7280'
            }}>
              2
            </div>
            <span style={{
              ...styles.stepLabel,
              color: currentStep >= 2 ? '#28D69F' : '#6B7280',
              fontWeight: currentStep >= 2 ? '600' : '400'
            }}>
              Select Purpose
            </span>
          </div>
          <div style={styles.stepConnector}></div>
          <div style={{
            ...styles.step, 
            ...(currentStep >= 3 ? styles.activeStep : styles.inactiveStep)
          }}>
            <div style={{
              ...styles.stepNumber,
              backgroundColor: currentStep >= 3 ? '#28D69F' : '#E5E7EB',
              color: currentStep >= 3 ? 'white' : '#6B7280'
            }}>
              3
            </div>
            <span style={{
              ...styles.stepLabel,
              color: currentStep >= 3 ? '#28D69F' : '#6B7280',
              fontWeight: currentStep >= 3 ? '600' : '400'
            }}>
              Choose Date
            </span>
          </div>
        </div>
      </div>
      
      {error && (
        <div style={styles.errorAlert}>
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Step 1: File Upload */}
        <div style={currentStep === 1 ? styles.activeStepContent : styles.inactiveStepContent}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Select File *
              <span style={styles.fileInfo}>(PDF, Word, JPEG, PNG - Max 10MB)</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={styles.fileInput}
              required
            />
            {file && (
              <div style={styles.fileDetails}>
                <p style={styles.fileInfo}>
                  ✅ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                {countingPages ? (
                  <p style={styles.pageInfo}>📄 Counting pages...</p>
                ) : (
                  <p style={styles.pageInfo}>
                    📄 Pages detected: <strong>{pageCount} pages</strong>
                  </p>
                )}
              </div>
            )}
          </div>
          
          {file && pageCount > 0 && (
            <div style={styles.stepNavigation}>
              <button 
                type="button" 
                onClick={handleStepForward}
                style={styles.nextButton}
              >
                Next: Select Purpose →
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Purpose Selection */}
        <div style={currentStep === 2 ? styles.activeStepContent : styles.inactiveStepContent}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Purpose *</label>
            <select
              value={form.purpose}
              onChange={handlePurposeChange}
              style={styles.select}
              required
            >
              <option value="">-- Select Purpose --</option>
              <option value="For School">For School</option>
              <option value="For Work">For Work</option>
              <option value="Others">Others</option>
            </select>
          </div>
          
          <div style={styles.stepNavigation}>
            <button 
              type="button" 
              onClick={handleStepBack}
              style={styles.backButton}
            >
              ← Back to File Upload
            </button>
            {form.purpose && (
              <button 
                type="button" 
                onClick={handleStepForward}
                style={styles.nextButton}
              >
                Next: Choose Date →
              </button>
            )}
          </div>
        </div>

        {/* Step 3: Date Selection */}
        <div style={currentStep === 3 ? styles.activeStepContent : styles.inactiveStepContent}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Date *</label>
            <div style={styles.calendarContainer}>
              <Calendar
                onChange={handleDateSelect}
                value={getCalendarValue()}
                minDate={new Date()}
                tileClassName={tileClassName}
                tileContent={tileContent}
              />
            </div>
            
            {/* Selected Date Display */}
            {form.dateNeeded && (
              <div style={styles.selectedDate}>
                <strong>Selected Date:</strong> {form.dateNeeded}
              </div>
            )}
            
            {/* Calendar Legend */}
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: '#22C55E'}}></div>
                <span>Available (30+ pages)</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: '#F59E0B'}}></div>
                <span>Medium (11-30 pages)</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: '#EF4444'}}></div>
                <span>Low (1-10 pages)</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, backgroundColor: '#6B7280'}}></div>
                <span>Full (0 pages)</span>
              </div>
            </div>

            {form.dateNeeded && availability.date && (
              <div style={styles.availabilityInfo}>
                <p style={styles.availabilityText}>
                  📊 Availability for {form.dateNeeded}:
                </p>
                <p style={styles.availabilityText}>
                  Your remaining pages: <strong>{availability.residentSlotsLeft || 0}</strong> / 30
                </p>
                <p style={styles.availabilityText}>
                  System remaining pages: <strong>{availability.slotsLeft || 0}</strong> / 100
                </p>
                {file && pageCount > 0 && (
                  <p style={styles.availabilityText}>
                    This request will use: <strong>{pageCount} pages</strong>
                  </p>
                )}
                {(availability.isFull || availability.residentFull) && (
                  <p style={styles.availabilityWarning}>
                    ⚠️ {availability.isFull ? 'System limit reached' : 'Your personal limit reached'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Special Instructions (Optional)</label>
            <textarea
              value={form.specialInstructions}
              onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
              style={styles.textarea}
              placeholder="Any special instructions for processing (e.g., color printing, double-sided, etc.)..."
              rows="3"
            />
          </div>
          
          <div style={styles.stepNavigation}>
            <button 
              type="button" 
              onClick={handleStepBack}
              style={styles.backButton}
            >
              ← Back to Purpose
            </button>
          </div>
        </div>

        {/* Submit Button - Only show when all steps are complete */}
        {currentStep === 3 && form.dateNeeded && (
          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              backgroundColor: uploading ? '#ccc' : 
                             (pageCount > availability.residentSlotsLeft || pageCount > availability.slotsLeft) ? '#EF4444' : '#28D69F',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
            disabled={uploading || !file || !form.dateNeeded || !form.purpose || pageCount === 0}
          >
            {uploading ? "📤 Uploading..." : 
             (pageCount > availability.residentSlotsLeft || pageCount > availability.slotsLeft) ? "❌ Exceeds Limit" : "✅ Submit Request"}
          </button>
        )}
      </form>

      {/* Add Calendar Styles */}
      <style>
        {`
          .past-date {
            background-color: #F3F4F6 !important;
            color: #9CA3AF !important;
          }
          
          .available-date {
            background-color: #DCFCE7 !important;
            color: #166534 !important;
          }
          
          .medium-availability-date {
            background-color: #FEF3C7 !important;
            color: #92400E !important;
          }
          
          .low-availability-date {
            background-color: #FEE2E2 !important;
            color: #991B1B !important;
          }
          
          .fully-booked-date {
            background-color: #6B7280 !important;
            color: white !important;
          }
          
          .react-calendar__tile:disabled {
            background-color: #F3F4F6 !important;
            color: #9CA3AF !important;
          }
          
          .react-calendar__tile--active {
            background-color: #3B82F6 !important;
            color: white !important;
          }
        `}
      </style>
    </section>
  );
}

const styles = {
  formSection: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "25px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    color: "#2D3748",
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #1E90FF 0%, #28D69F 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  // Progress Steps
  progressContainer: {
    marginBottom: "30px",
  },
  progressSteps: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  step: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  stepNumber: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "16px",
    transition: "all 0.3s ease",
  },
  stepLabel: {
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  stepConnector: {
    width: "60px",
    height: "2px",
    backgroundColor: "#E5E7EB",
    margin: "0 5px",
  },
  // Step Content
  activeStepContent: {
    display: "block",
  },
  inactiveStepContent: {
    display: "none",
  },
  stepNavigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    gap: "10px",
  },
  backButton: {
    padding: "10px 16px",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textDecoration: "none",
  },
  nextButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#28D69F",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "8px",
    fontWeight: "600",
    color: "#2D3748",
    fontSize: "14px",
  },
  fileInfo: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "normal",
    marginLeft: "5px",
  },
  fileDetails: {
    marginTop: "8px",
  },
  pageInfo: {
    fontSize: "13px",
    color: "#1E40AF",
    fontWeight: "500",
    margin: "4px 0",
  },
  availabilityInfo: {
    marginTop: "10px",
    padding: "12px",
    backgroundColor: "#F0F9FF",
    border: "1px solid #BAE6FD",
    borderRadius: "8px",
  },
  availabilityText: {
    fontSize: "12px",
    color: "#0369A1",
    margin: "2px 0",
  },
  availabilityWarning: {
    fontSize: "12px",
    color: "#DC2626",
    fontWeight: "bold",
    margin: "5px 0 0 0",
  },
  fileInput: {
    padding: "12px",
    border: "2px dashed #E2E8F0",
    borderRadius: "8px",
    backgroundColor: "#F7FAFC",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
  },
  select: {
    padding: "12px",
    border: "2px solid #E2E8F0",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    transition: "all 0.2s ease",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #E2E8F0",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    minHeight: "100px",
    transition: "all 0.2s ease",
  },
  submitButton: {
    padding: "15px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  errorAlert: {
    backgroundColor: "#FEF2F2",
    color: "#DC2626",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #FECACA",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },
  calendarContainer: {
    border: "2px solid #E2E8F0",
    borderRadius: "8px",
    padding: "15px",
    backgroundColor: "#F7FAFC",
  },
  calendarTileContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  availablePages: {
    fontSize: "10px",
    fontWeight: "bold",
    marginTop: "2px",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "15px",
    justifyContent: "center",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
  },
  legendColor: {
    width: "16px",
    height: "16px",
    borderRadius: "3px",
    border: "1px solid #ccc",
  },
  selectedDate: {
    marginTop: "10px",
    padding: "8px 12px",
    backgroundColor: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#1E40AF",
    textAlign: "center",
  },
};

// Add hover and focus effects
Object.assign(styles.fileInput, {
  ":hover": {
    borderColor: "#1E90FF",
    backgroundColor: "#EDF2F7",
  },
  ":focus": {
    outline: "none",
    borderColor: "#28D69F",
    boxShadow: "0 0 0 3px rgba(40, 214, 159, 0.1)",
  }
});

Object.assign(styles.select, {
  ":focus": {
    outline: "none",
    borderColor: "#28D69F",
    boxShadow: "0 0 0 3px rgba(40, 214, 159, 0.1)",
  }
});

Object.assign(styles.textarea, {
  ":focus": {
    outline: "none",
    borderColor: "#28D69F",
    boxShadow: "0 0 0 3px rgba(40, 214, 159, 0.1)",
  }
});

Object.assign(styles.submitButton, {
  ":hover": {
    backgroundColor: "#22C095",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(40, 214, 159, 0.3)",
  },
  ":active": {
    transform: "translateY(0)",
  }
});

Object.assign(styles.backButton, {
  ":hover": {
    backgroundColor: "#F3F4F6",
    borderColor: "#9CA3AF",
  }
});

Object.assign(styles.nextButton, {
  ":hover": {
    backgroundColor: "#22C095",
    transform: "translateY(-1px)",
    boxShadow: "0 2px 8px rgba(40, 214, 159, 0.3)",
  }
});