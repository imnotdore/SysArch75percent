import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../config";
import { useNavigate } from "react-router-dom"; // Add this
import Calendar from "react-calendar";
import "../styles/RequestForm.css";
import "react-calendar/dist/Calendar.css";
import { 
  Upload, 
  FileText, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Loader2
} from "lucide-react";

export default function RequestForm() {
  const navigate = useNavigate(); // Add this
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
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLimits, setCurrentLimits] = useState({
    resident: 30,
    system: 100
  });
  const fileInputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetchAllDatesAvailability();
    fetchLimits();
  }, []);

  // Fetch date availability
  useEffect(() => {
    if (form.dateNeeded) {
      checkAvailability(form.dateNeeded);
    }
  }, [form.dateNeeded]);

  // Auto-advance steps
  useEffect(() => {
    if (currentStep === 1 && file && pageCount > 0) {
      setTimeout(() => setCurrentStep(2), 300);
    }
    if (currentStep === 2 && form.purpose) {
      setTimeout(() => setCurrentStep(3), 300);
    }
  }, [file, pageCount, form.purpose, currentStep]);

  // Helper functions
  const formatDateToLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const getTodayLocal = () => {
    return formatDateToLocal(new Date());
  };

  const fetchLimits = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/files/limits/resident`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.data) {
        const limits = response.data.data;
        
        setCurrentLimits({
          resident: limits.residentLimit || 30,
          system: limits.systemLimit || 100
        });
        
        if (form.dateNeeded) {
          const today = new Date().toISOString().split('T')[0];
          if (form.dateNeeded === today) {
            setAvailability(prev => ({
              ...prev,
              residentLimit: limits.residentLimit,
              systemLimit: limits.systemLimit,
              residentRemaining: limits.residentRemaining,
              systemRemaining: limits.systemRemaining,
              residentUsed: limits.residentUsed,
              systemUsed: limits.systemUsed
            }));
          }
        }
      }
    } catch (error) {
      setCurrentLimits({
        resident: 30,
        system: 100
      });
    }
  };
  
  const fetchAllDatesAvailability = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/files/availability`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const dates = response.data.data || response.data.dates || [];
        setAllDatesAvailability(dates);
      }
    } catch (error) {
      setAllDatesAvailability([]);
    }
  };

  const checkAvailability = async (date) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/files/availability/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setAvailability({
          residentLimit: response.data.residentLimit || currentLimits.resident,
          systemLimit: response.data.systemLimit || currentLimits.system,
          residentRemaining: response.data.residentRemaining || 0,
          systemRemaining: response.data.systemRemaining || 0,
          residentUsed: response.data.residentUsed || 0,
          systemUsed: response.data.systemUsed || 0,
          residentFull: response.data.residentFull || false,
          systemFull: response.data.systemFull || false
        });
      }
    } catch (error) {
      setAvailability({
        residentLimit: currentLimits.resident,
        systemLimit: currentLimits.system,
        residentRemaining: currentLimits.resident,
        systemRemaining: currentLimits.system,
        residentUsed: 0,
        systemUsed: 0,
        residentFull: false,
        systemFull: false
      });
    }
  };

  const countPDFPages = (file) => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      
      fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        
        if (window.pdfjsLib) {
          const loadingTask = pdfjsLib.getDocument(typedarray);
          loadingTask.promise.then(pdf => {
            resolve(pdf.numPages);
          }).catch(() => {
            const estimatedPages = Math.max(1, Math.ceil(file.size / 50000));
            resolve(estimatedPages);
          });
        } else {
          const estimatedPages = Math.max(1, Math.ceil(file.size / 50000));
          resolve(estimatedPages);
        }
      };
      
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

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
      
      if (selectedFile.type === 'application/pdf') {
        pages = await countPDFPages(selectedFile);
      } else if (selectedFile.type.includes('word') || 
                 selectedFile.type.includes('document')) {
        pages = Math.max(1, Math.ceil(selectedFile.size / 30000));
      } else if (selectedFile.type.includes('image')) {
        pages = 1;
      }
      
      setPageCount(pages);
    } catch (err) {
      setPageCount(1);
    } finally {
      setCountingPages(false);
    }
  };

  const handleDateSelect = (date) => {
    const selectedDate = formatDateToLocal(date);
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

    // Check limits
    if (pageCount > availability.residentRemaining) {
      setError(`You can only upload ${availability.residentRemaining} more pages for this date. Your file requires ${pageCount} pages.`);
      return;
    }

    if (pageCount > availability.systemRemaining) {
      setError(`Only ${availability.systemRemaining} pages left available in the system for this date. Your file requires ${pageCount} pages.`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", form.purpose);
    formData.append("dateNeeded", form.dateNeeded);
    formData.append("pageCount", pageCount.toString());
    if (form.specialInstructions) {
      formData.append("specialInstructions", form.specialInstructions);
    }

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
      
      if (response.data.success) {
        alert(`${response.data.message || "File uploaded successfully!"} Total pages: ${pageCount}`);
        
        // Reset form
        setForm({ purpose: "", dateNeeded: "", specialInstructions: "" });
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
        checkAvailability(form.dateNeeded);
        
        // Redirect to Your Account after 1 second
        setTimeout(() => {
          navigate("/resident/youraccount");
        }, 1000);
        
      } else {
        setError(response.data.error || "Upload failed");
      }
      
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        setError(errorData.error || errorData.message || `Upload failed: ${error.response.status}`);
      } else if (error.request) {
        setError("Network error: Please check your connection");
      } else {
        setError("Upload failed: " + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = formatDateToLocal(date);
    const today = getTodayLocal();
    
    if (dateStr < today) return 'past-date';
    
    const dateAvailability = allDatesAvailability.find(d => d.date_needed === dateStr);
    
    if (!dateAvailability) return 'normal-date';
    
    const systemRemaining = dateAvailability.system_remaining || 0;
    
    if (systemRemaining <= 10) {
      return 'critical-date';
    } else if (systemRemaining <= 15) {
      return 'warning-date';
    } else {
      return 'good-date';
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = formatDateToLocal(date);
    const today = getTodayLocal();
    
    if (dateStr < today) return null;
    
    const dateAvailability = allDatesAvailability.find(d => d.date_needed === dateStr);
    
    if (dateAvailability) {
      return (
        <div className="tile-content">
          <div className="resident-pages">
            {dateAvailability.resident_remaining || 0}
          </div>
          <div className="system-pages">
            {dateAvailability.system_remaining || 0}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const getCalendarValue = () => {
    if (!form.dateNeeded) return null;
    const [year, month, day] = form.dateNeeded.split('-');
    return new Date(year, month - 1, day);
  };

  return (
    <div className="request-form-container">
      <div className="libreng-print-title-only">
        <h2>📅 FREE PRINTING </h2>
      </div>
      
      {/* Step 1: Upload File */}
      {currentStep === 1 && (
        <div className="step-page">
          <div className="form-header">
            <div className="header-icon">
              <Upload size={32} />
            </div>
            <h1>Upload Your File</h1>
            <p className="subtitle">Select the file you want to print</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="file-upload-area" onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="file-input"
            />
            <div className="upload-placeholder">
              <Upload size={48} className="upload-icon" />
              <p className="upload-text">
                <strong>Click to browse</strong> or drag and drop
              </p>
              <p className="upload-subtext">PDF, Word, JPEG, PNG (Max 10MB)</p>
            </div>
          </div>

          {file && (
            <div className="file-preview">
              <div className="file-info">
                <FileText className="file-icon" />
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="page-count">
                {countingPages ? (
                  <div className="counting">
                    <Loader2 className="spinner" />
                    <span>Counting pages...</span>
                  </div>
                ) : (
                  <div className="count-display">
                    <span className="count-label">Total Pages:</span>
                    <span className="count-value">{pageCount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {file && pageCount > 0 && (
            <div className="navigation">
              <button 
                type="button" 
                onClick={handleStepForward}
                className="next-button"
              >
                Continue to Purpose
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Purpose */}
      {currentStep === 2 && (
        <div className="step-page">
          <div className="form-header">
            <div className="header-icon">
              <FileText size={32} />
            </div>
            <h1>Select Purpose</h1>
            <p className="subtitle">Choose the purpose for your print request</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="purpose-grid">
            {["For School", "For Work", "Personal", "Business", "Others"].map((purpose) => (
              <button
                key={purpose}
                type="button"
                className={`purpose-option ${form.purpose === purpose ? 'selected' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, purpose }))}
              >
                <span className="purpose-text">{purpose}</span>
                {form.purpose === purpose && <CheckCircle className="check-icon" />}
              </button>
            ))}
          </div>

          <div className="navigation">
            <button 
              type="button" 
              onClick={handleStepBack}
              className="back-button"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            {form.purpose && (
              <button 
                type="button" 
                onClick={handleStepForward}
                className="next-button"
              >
                Continue to Date Selection
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Choose Date */}
      {currentStep === 3 && (
        <div className="step-page">
          <div className="form-header">
            <div className="header-icon">
              <CalendarIcon size={32} />
            </div>
            <h1>Choose Delivery Date</h1>
            <p className="subtitle">Select when you need your prints</p>
          </div>

          {error && (
            <div className="error-alert">
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="calendar-section">
            <div className="calendar-wrapper">
              <Calendar
                onChange={handleDateSelect}
                value={getCalendarValue()}
                minDate={new Date()}
                tileClassName={tileClassName}
                tileContent={tileContent}
              />
            </div>
          </div>

          {form.dateNeeded && (
            <div className="availability-card">
              <div className="availability-header">
                <h3>{form.dateNeeded} - Availability Status</h3>
              </div>
              
              <div className="availability-meters">
                <div className="meter">
                  <div className="meter-header">
                    <span className="meter-label">Your available pages to upload</span>
                    <span className="meter-value">
                      {availability.residentRemaining || 0} / {availability.residentLimit || currentLimits.resident}
                    </span>
                  </div>
                  <div className="meter-bar">
                    <div 
                      className="meter-fill personal"
                      style={{ 
                        width: `${((availability.residentRemaining || 0) / (availability.residentLimit || currentLimits.resident)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="meter">
                  <div className="meter-header">
                    <span className="meter-label">System Available Pages</span>
                    <span className="meter-value">
                      {availability.systemRemaining || 0} / {availability.systemLimit || currentLimits.system}
                    </span>
                  </div>
                  <div className="meter-bar">
                    <div 
                      className="meter-fill system"
                      style={{ 
                        width: `${((availability.systemRemaining || 0) / (availability.systemLimit || currentLimits.system)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {file && pageCount > 0 && (
                <div className="page-usage">
                  <div className="usage-label">This request will use:</div>
                  <div className="usage-value">{pageCount} pages</div>
                </div>
              )}

              {(availability.systemFull || availability.residentFull) && (
                <div className="availability-warning">
                  <AlertTriangle size={18} />
                  <span>
                    {availability.systemFull ? 'System limit reached' : 'Your personal limit reached'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="navigation">
            <button 
              type="button" 
              onClick={handleStepBack}
              className="back-button"
            >
              <ChevronLeft size={20} />
              Back to Purpose
            </button>
            {form.dateNeeded && (
              <button 
                type="button" 
                onClick={handleSubmit}
                className="submit-button"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="spinner" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Submit Printing Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}