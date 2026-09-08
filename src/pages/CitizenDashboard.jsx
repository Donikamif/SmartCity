import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import ReportFormSection from '../components/organisms/ReportFormSection';
import MapViewSection from '../components/organisms/MapViewSection';
import './CitizenDashboard.css';

export default function CitizenDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'map'
  const [reports, setReports] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Real-time listener for Firestore "reports" collection
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(fetchedReports);
    }, (error) => {
      console.error("Error subscribing to Firestore reports:", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredReports = selectedCategory === 'All' 
    ? reports 
    : reports.filter(r => r.category === selectedCategory);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Navigation Header */}
      <header style={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '12px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              backgroundColor: '#009688', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#ffffff' 
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>SmartCity</span>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button"
              onClick={() => setActiveTab('dashboard')}
              style={{
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'dashboard' ? '#009688' : 'transparent',
                color: activeTab === 'dashboard' ? '#ffffff' : '#334155',
                transition: 'all 0.15s ease'
              }}
            >
              Dashboard
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('map')}
              style={{
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'map' ? '#009688' : 'transparent',
                color: activeTab === 'map' ? '#ffffff' : '#334155',
                transition: 'all 0.15s ease'
              }}
            >
              Map View
            </button>
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
                {user?.displayName || 'Demo Citizen'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Citizen</div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '960px', margin: '32px auto', padding: '0 20px' }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Top Section: Report Form */}
            <ReportFormSection 
              currentUser={user} 
              onAddReport={() => setActiveTab('dashboard')} 
            />

            {/* Bottom Section: Category Filter & Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['All', 'Roads', 'Water', 'Parks', 'Electricity', 'Sanitation'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 18px',
                      borderRadius: '20px',
                      border: selectedCategory === cat ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: selectedCategory === cat ? '#009688' : '#ffffff',
                      color: selectedCategory === cat ? '#ffffff' : '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Feed Cards */}
              {filteredReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>No reports recorded yet.</p>
                </div>
              ) : (
                filteredReports.map(report => (
                  <div 
                    key={report.id} 
                    style={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '12px', 
                      padding: '20px 24px', 
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)' 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                          {report.category}
                        </span>
                        <h4 style={{ margin: '8px 0 0 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                          {report.location}
                        </h4>
                      </div>
                      <span style={{ 
                        padding: '3px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: report.status === 'Resolved' ? '#dcfce7' : '#fef3c7',
                        color: report.status === 'Resolved' ? '#15803d' : '#b45309'
                      }}>
                        {report.status || 'Pending'}
                      </span>
                    </div>

                    <p style={{ color: '#334155', fontSize: '0.925rem', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                      {report.description}
                    </p>

                    {report.imageUrl && (
                      <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', maxHeight: '280px', backgroundColor: '#f8fafc' }}>
                        <img src={report.imageUrl} alt="Report attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <span>Reported by: <strong style={{ color: '#1e293b' }}>{report.author || 'Demo Citizen'}</strong></span>
                      <span>{report.date || '9/8/2026'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MAP VIEW TAB */}
        {activeTab === 'map' && <MapViewSection />}

      </main>
    </div>
  );
}