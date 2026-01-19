// components/admin/PageLimitManager.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./styles/PageLimitManager.css";

export default function PageLimitManager() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  const [limits, setLimits] = useState({
    resident: 30,
    global: 100
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    // Tignan kung alin ang tamang path base sa server.js
    const res = await axios.get(`${API_URL}/api/auth/admin/page-limits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
      
      if (res.data.success) {
        // Extract limits from response
        const limitsData = res.data.data || [];
        const newLimits = {
          resident: 30,
          global: 100
        };
        
        limitsData.forEach(limit => {
          if (limit.type === 'resident') newLimits.resident = limit.value;
          if (limit.type === 'global') newLimits.global = limit.value;
        });
        
        setLimits(newLimits);
      }
    } catch (err) {
      console.error("Error fetching limits:", err);
      setError("Failed to fetch page limits");
    } finally {
      setLoading(false);
    }
  };

 // In PageLimitManager.jsx, update the handleSaveLimits function:
// PageLimitManager.jsx - Update handleSaveLimits
const handleSaveLimits = async () => {
  try {
    setSaving(true);
    setMessage("");
    setError("");
    
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    // Save resident limit
    const residentResponse = await axios.put(
      `${API_URL}/api/auth/admin/page-limits`,
      { 
        type: 'resident', 
        value: limits.resident,
        updated_by: userId
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (residentResponse.data.success) {
      // Save global limit
      await axios.put(
        `${API_URL}/api/auth/admin/page-limits`,
        { 
          type: 'global', 
          value: limits.global,
          updated_by: userId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage("Page limits updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
  } catch (err) {
    console.error("Error saving limits:", err);
    setError(err.response?.data?.error || "Failed to save page limits");
  } finally {
    setSaving(false);
  }
};

  const handleLimitChange = (type, value) => {
    const numValue = parseInt(value) || 0;
    setLimits(prev => ({
      ...prev,
      [type]: Math.max(0, numValue)
    }));
  };

  const resetToDefaults = () => {
    setLimits({
      resident: 30,
      global: 100
    });
  };

  if (loading) {
    return <div className="page-limit-loading">Loading page limits...</div>;
  }

  return (
    <div className="page-limit-manager">
      <div className="page-limit-header">
        <h1>📄 Page Limit Management</h1>
        <p className="subtitle">Control printing page limits for residents</p>
      </div>

      {message && (
        <div className="success-message">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="limits-grid">
        {/* Resident Monthly Limit */}
        <div className="limit-card">
          <div className="limit-card-header">
            <h3>👤 Resident Limit</h3>
            <div className="limit-badge">Per Resident</div>
          </div>
          <p className="limit-description">
            Maximum pages a resident can upload/print
          </p>
          <div className="limit-control">
            <div className="limit-input-group">
              <input
                type="number"
                min="0"
                max="1000"
                value={limits.resident}
                onChange={(e) => handleLimitChange('resident', e.target.value)}
                className="limit-input"
              />
              <span className="limit-unit">pages</span>
            </div>
            <div className="limit-examples">
              <small>Example values: 20, 30, 50 pages</small>
            </div>
          </div>
        </div>

        {/* System Global Limit */}
        <div className="limit-card">
          <div className="limit-card-header">
            <h3>🏢 Global Limit</h3>
            <div className="limit-badge">System Total</div>
          </div>
          <p className="limit-description">
            Maximum pages the entire system can handle
          </p>
          <div className="limit-control">
            <div className="limit-input-group">
              <input
                type="number"
                min="0"
                max="10000"
                value={limits.global}
                onChange={(e) => handleLimitChange('global', e.target.value)}
                className="limit-input"
              />
              <span className="limit-unit">pages</span>
            </div>
            <div className="limit-examples">
              <small>Example values: 100, 200, 500 pages</small>
            </div>
          </div>
        </div>
      </div>

      <div className="limit-summary">
        <h3>📋 Current Limits Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Resident Limit:</span>
            <span className="summary-value">{limits.resident} pages</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Global Limit:</span>
            <span className="summary-value">{limits.global} pages</span>
          </div>
        </div>
        <div className="limit-info">
          <p><strong>Note:</strong> These limits apply to the free printing service for residents.</p>
          <p>When a resident uploads files, their page count will be checked against these limits.</p>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn-reset"
          onClick={resetToDefaults}
        >
          🔄 Reset to Defaults
        </button>
        <button 
          className="btn-save"
          onClick={handleSaveLimits}
          disabled={saving}
        >
          {saving ? "Saving..." : "💾 Save Limits"}
        </button>
      </div>
    </div>
  );
}