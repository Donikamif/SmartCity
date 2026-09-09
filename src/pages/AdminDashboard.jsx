import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import Analytics from '../components/Analytics';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        status: docSnap.data().status || 'Pending',
        category: docSnap.data().category || 'Roads',
        upvotes: docSnap.data().upvotes || docSnap.data().votes || 0
      }));
      setReports(fetchedReports);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Calculations for Overview stats
  const totalReports = reports.length || 6;
  const pendingCount = reports.filter(r => r.status === 'Pending').length || 3;
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length || 2;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length || 1;
  const completionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 17;

  const categories = [
    { name: 'Roads', count: 1, color: '#ef4444' },
    { name: 'Street Lights', count: 1, color: '#8b5cf6' },
    { name: 'Sanitation', count: 1, color: '#10b981' },
    { name: 'Water', count: 1, color: '#3b82f6' },
    { name: 'Parks', count: 1, color: '#06b6d4' }
  ];

  const defaultHighPriority = [
    { category: 'Sanitation', title: 'Garbage not collected for 3 days. Overflowing bins attracting pests.', location: 'Maple Drive, East Side', votes: 62 },
    { category: 'Roads', title: 'Large pothole on Main Street causing traffic issues. Multiple vehicles damaged.', location: 'Main Street, Downtown', votes: 45 },
    { category: 'Health', title: 'Stray dogs gathering near school entrance posing safety risks.', location: 'School District 4', votes: 41 }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Navbar */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>
            <span style={{ backgroundColor: '#0d9488', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </span>
            SmartCity
          </div>

          <nav style={{ display: 'flex', gap: '4px' }}>
            {['Overview', 'Analytics', 'Heatmap', 'Issues', 'Users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === tab ? '#0d9488' : 'transparent',
                  color: activeTab === tab ? '#ffffff' : '#64748b',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#f1f5f9', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#334155'
            }}>
              👤
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {user?.displayName || user?.email?.split('@')[0] || 'ddonikamiftari'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Admin</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Overview Tab UI */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                Admin Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                Monitor and manage the city's issue reporting system
              </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  Total Reports <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>!</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '12px 0 4px 0' }}>{totalReports}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>All time</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  Pending <span style={{ color: '#d97706' }}>⏱️</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d97706', margin: '12px 0 4px 0' }}>{pendingCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{Math.round((pendingCount / totalReports) * 100)}% of total</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  In Progress <span style={{ color: '#2563eb' }}>📈</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb', margin: '12px 0 4px 0' }}>{inProgressCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{Math.round((inProgressCount / totalReports) * 100)}% of total</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  Resolved <span style={{ color: '#16a34a' }}>✅</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a', margin: '12px 0 4px 0' }}>{resolvedCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{completionRate}% completion rate</div>
              </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Top Issue Categories */}
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Top Issue Categories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {categories.map((cat, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                          {cat.name}
                        </span>
                        <span style={{ color: '#64748b' }}>1 (17%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '17%', height: '100%', backgroundColor: cat.color, borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High Priority Issues */}
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ef4444' }}>📈</span> High Priority Issues
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {defaultHighPriority.map((item, idx) => (
                    <div key={idx} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                          {item.category}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                          📈 {item.votes} votes
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155', lineHeight: 1.4 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📍 {item.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'Analytics' && <Analytics reports={reports} />}

        {/* Issues Tab */}
        {activeTab === 'Issues' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Manage Reports & Issues</h1>
            {reports.map((report) => (
              <div key={report.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{report.category} - {report.location}</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{report.description}</div>
                </div>
                <select
                  value={report.status}
                  onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'Heatmap' && (
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h2 style={{ color: '#0f172a' }}>City Issue Heatmap</h2>
            <p style={{ color: '#64748b' }}>Geographic distribution of reported civic issues across Vushtrri.</p>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'Users' && (
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h2 style={{ color: '#0f172a' }}>User Management</h2>
            <p style={{ color: '#64748b' }}>Registered citizens and administrative personnel control panel.</p>
          </div>
        )}

      </main>
    </div>
  );
}