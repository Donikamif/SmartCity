import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const VUSHTRRI_LOCATIONS = [
  'Qendra (Center), Vushtrri',
  'Rruga Adem Jashari, Vushtrri',
  'Rruga Ismail Qemali, Vushtrri',
  'Rruga Dëshmorët e Kombit, Vushtrri',
  'Kalaja e Vushtrrisë (Castle Area), Vushtrri',
  'Ura e Gurit, Vushtrri',
  'Sfaraçak, Vushtrri',
  'Maxhunaj, Vushtrri'
];

export default function ReportFormSection({ onAddReport, currentUser }) {
  const [category, setCategory] = useState('Roads');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert uploaded image to base64 string
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  // GPS Fallback & Coordinate Capture for Vushtrri
  const handleUseGPS = () => {
    setIsGeolocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Vushtrri (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`);
          setIsGeolocating(false);
        },
        () => {
          setLocation('Qendra, Vushtrri, Kosovo (42.8231° N, 20.9675° E)');
          setIsGeolocating(false);
        }
      );
    } else {
      setLocation('Qendra, Vushtrri, Kosovo');
      setIsGeolocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const finalLocation = location.trim() 
      ? (location.toLowerCase().includes('vushtrri') ? location : `${location}, Vushtrri`)
      : 'Qendra, Vushtrri';

    try {
      const newReportData = {
        status: 'Pending',
        category: category,
        description: description.trim(),
        imageUrl: imagePreview || null,
        location: finalLocation,
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('en-US'),
        author: currentUser?.displayName || currentUser?.email || 'Demo Citizen',
        userId: currentUser?.uid || null,
        upvotes: 0,
        commentsCount: 0,
        assignedTo: null
      };

      // Write directly to Firestore "reports" collection
      const docRef = await addDoc(collection(db, "reports"), newReportData);

      if (onAddReport) {
        onAddReport({ id: docRef.id, ...newReportData });
      }

      // Reset form
      setDescription('');
      setLocation('');
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting report to Firebase:", error);
      alert("Failed to submit report. Please check your connection or Firebase config.");
    } finally {
      setIsSubmitting(false);
    }
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
          <h3>Report an Issue in Vushtrri</h3>
          <p>Help improve our municipality by reporting local urban issues</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Roads">Roads & Sidewalks</option>
              <option value="Water">Water & Sewage</option>
              <option value="Parks">Parks & Public Spaces</option>
              <option value="Electricity">Electricity & Lighting</option>
              <option value="Sanitation">Sanitation & Waste</option>
            </select>
          </div>

          <div className="form-group flex-1">
            <label>Location in Vushtrri</label>
            <div className="input-with-icon">
              <input 
                type="text" 
                list="vushtrri-locations"
                placeholder="e.g. Rruga Adem Jashari, Vushtrri" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
              />
              <datalist id="vushtrri-locations">
                {VUSHTRRI_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={loc} />
                ))}
              </datalist>
              <button 
                type="button" 
                className="gps-btn" 
                onClick={handleUseGPS}
                title="Get GPS Coordinates in Vushtrri"
              >
                {isGeolocating ? '...' : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                )}
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
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label>Photo (Optional)</label>
          <div className="upload-container">
            <label htmlFor="photo-upload" className="upload-photo-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              {imagePreview ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input 
              id="photo-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: 'none' }}
            />
            {imagePreview && (
              <div className="preview-thumbnail">
                <img src={imagePreview} alt="Preview" />
                <button type="button" onClick={handleRemoveImage} title="Remove image">×</button>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="submit-report-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting to Firestore...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}