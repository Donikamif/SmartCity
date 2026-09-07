import React, { useState } from 'react';

export default function ReportFormSection({ onAddReport }) {
  const [category, setCategory] = useState('Roads');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReport = {
      id: Date.now(),
      status: 'Pending',
      category: category,
      description: description,
      image: null,
      location: location || 'Unspecified Location',
      date: new Date().toLocaleDateString('en-US'),
      author: 'Demo Citizen',
      upvotes: 0,
      commentsCount: 0,
      assignedTo: null
    };

    onAddReport(newReport);
    setDescription('');
    setLocation('');
  };

  return (
    <div className="report-form-card">
      <div className="form-header-banner">
        <div className="info-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00796b" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h3>Report an Issue</h3>
          <p>Help improve your city by reporting urban issues</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Roads">Roads</option>
              <option value="Water">Water</option>
              <option value="Parks">Parks</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
            </select>
          </div>

          <div className="form-group flex-1">
            <label>Location</label>
            <div className="input-with-icon">
              <input 
                type="text" 
                placeholder="Enter address or use GPS" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
              />
              <button type="button" className="gps-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea 
            rows="3" 
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Photo (Optional)</label>
          <div>
            <button type="button" className="upload-photo-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              Upload Photo
            </button>
          </div>
        </div>

        <button type="submit" className="submit-report-btn">
          Submit Report
        </button>
      </form>
    </div>
  );
}