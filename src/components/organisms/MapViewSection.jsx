import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Fix for default Leaflet marker icon pathing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default coordinates centered on Vushtrri, Kosovo
const VUSHTRRI_CENTER = [42.8231, 20.9675];

export default function MapViewSection() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(fetchedReports);
    }, (error) => {
      console.error("Error fetching map points:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Map Container Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Interactive Issue Map
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Real-time map view of reported urban issues in Vushtrri
            </p>
          </div>
          <span style={{
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            {reports.length} Reports Plotted
          </span>
        </div>

        {/* Real Leaflet Map Render */}
        <div style={{ height: '420px', width: '100%' }}>
          <MapContainer 
            center={VUSHTRRI_CENTER} 
            zoom={14} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Default map pin on central Vushtrri */}
            <Marker position={VUSHTRRI_CENTER}>
              <Popup>
                <div style={{ padding: '4px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Vushtrri Center</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Municipal Reporting Hub</p>
                </div>
              </Popup>
            </Marker>

            {/* Plot active Firestore reports if lat/lng are provided */}
            {reports.map((report) => {
              if (report.lat && report.lng) {
                return (
                  <Marker key={report.id} position={[report.lat, report.lng]}>
                    <Popup>
                      <div style={{ padding: '4px', maxWidth: '200px' }}>
                        <span style={{
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>
                          {report.category}
                        </span>
                        <h4 style={{ margin: '6px 0 4px 0', fontSize: '0.875rem', color: '#0f172a' }}>
                          {report.location}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.3 }}>
                          {report.description}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>
      </div>

      {/* Nearby Issues Scroll List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
          Nearby Reported Issues
        </h3>

        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
            No active map reports found.
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {report.location}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>{report.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{report.date || 'Today'}</span>
                  </div>
                </div>
              </div>

              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: report.status === 'Resolved' ? '#dcfce7' : '#fef3c7',
                color: report.status === 'Resolved' ? '#15803d' : '#b45309'
              }}>
                {report.status || 'Pending'}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}