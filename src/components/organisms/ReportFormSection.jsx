import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Fix for default Leaflet marker icon pathing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default coordinates centered on Vushtrri, Kosovo
const VUSHTRRI_CENTER = [42.8231, 20.9675];

// Map helper component to handle click events for pin placement
function LocationSelector({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position === null ? null : <Marker position={position} />;
}

export default function ReportFormSection({ currentUser, onAddReport }) {
  const [category, setCategory] = useState('Roads');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [position, setPosition] = useState(null); // stores [lat, lng]
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert('Please click on the map to pin the exact location of the issue in Vushtrri.');
      return;
    }

    setLoading(true);
    try {
      // Save report with lat and lng matching what MapViewSection expects
      await addDoc(collection(db, "reports"), {
        category,
        location: locationName,
        description,
        imageUrl: imageUrl || '',
        lat: position[0],
        lng: position[1],
        status: 'Pending',
        author: currentUser?.displayName || 'Demo Citizen',
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      });

      // Reset form fields
      setLocationName('');
      setDescription('');
      setImageUrl('');
      setPosition(null);
      if (onAddReport) onAddReport();
      alert('Report submitted successfully and pinned on the map!');
    } catch (error) {
      console.error('Error adding report:', error);
      alert('Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
        Report a New Issue in Vushtrri
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            >
              <option value="Roads">Roads</option>
              <option value="Water">Water</option>
              <option value="Parks">Parks</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Location Title / Street Name</label>
            <input 
              type="text" 
              placeholder="e.g. Dëshmorët e Kombit St." 
              value={locationName} 
              onChange={(e) => setLocationName(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Description</label>
          <textarea 
            placeholder="Describe the issue in detail..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows="3"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Image URL (Optional)</label>
          <input 
            type="url" 
            placeholder="https://example.com/image.jpg" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Click on the map to pin exact location in Vushtrri: {position && <span style={{ color: '#0284c7', fontWeight: 'normal' }}>({position[0].toFixed(4)}, {position[1].toFixed(4)})</span>}
          </label>
          <div style={{ height: '280px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <MapContainer 
              center={VUSHTRRI_CENTER} 
              zoom={14} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationSelector position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            backgroundColor: '#009688', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '12px', 
            fontWeight: 600, 
            fontSize: '0.95rem', 
            cursor: 'pointer',
            marginTop: '4px' 
          }}
        >
          {loading ? 'Submitting Report...' : 'Submit Report & Pin on Map'}
        </button>
      </form>
    </div>
  );
}