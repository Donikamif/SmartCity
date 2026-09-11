import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import Analytics from '../components/Analytics';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Users');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    const qReports = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubscribeReports = onSnapshot(qReports, (snapshot) => {
      const fetchedReports = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        status: docSnap.data().status || 'Pending',
        category: docSnap.data().category || 'Roads',
        upvotes: docSnap.data().upvotes || docSnap.data().votes || 0
      }));
      setReports(fetchedReports);
    });

    const qUsers = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setUsers(fetchedUsers);
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    return () => {
      unsubscribeReports();
      unsubscribeUsers();
    };
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

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
    { category: 'Sanitation', title: 'Container overflow near city market causing waste accumulation.', location: 'Sheshi Hasan Prishtina, Vushtrri', votes: 62 },
    { category: 'Roads', title: 'Damaged asphalt and deep potholes affecting vehicle traffic.', location: 'Rruga Dëshmorët e Kombit, Vushtrri', votes: 45 },
    { category: 'Street Lights', title: 'Non-functional lighting poles creating visibility risks at night.', location: 'Bajr Neighborhood, Vushtrri', votes: 41 }
  ];

  const baseDistricts = [
    {
      id: 'qender',
      name: 'Qendër (Center)',
      subtext: 'Sheshi Hasan Prishtina & Old Town',
      issues: 3,
      intensity: 'High',
      badgeClass: 'high',
      bgColor: 'linear-gradient(135deg, #fca5a5 0%, #fdba74 100%)'
    },
    {
      id: 'bajr',
      name: 'Bajr',
      subtext: 'Residential & Commercial Zone',
      issues: 2,
      intensity: 'Medium',
      badgeClass: 'medium',
      bgColor: 'linear-gradient(135deg, #fde68a 0%, #fef08a 100%)'
    },
    {
      id: 'stacioni',
      name: 'Stacioni',
      subtext: 'Railway Station & Surroundings',
      issues: 2,
      intensity: 'Low',
      badgeClass: 'low',
      bgColor: 'linear-gradient(135deg, #fef08a 0%, #d9f99d 100%)'
    },
    {
      id: 'gumnishte',
      name: 'Gumnishtë',
      subtext: 'Northern Sector',
      issues: 1,
      intensity: 'Low',
      badgeClass: 'low',
      bgColor: 'linear-gradient(135deg, #fef08a 0%, #d9f99d 100%)'
    },
    {
      id: 'malisheve',
      name: 'Malishevë',
      subtext: 'Southern Residential Area',
      issues: 1,
      intensity: 'Medium',
      badgeClass: 'medium',
      bgColor: 'linear-gradient(135deg, #fde68a 0%, #fef08a 100%)'
    }
  ];

  const districts = baseDistricts.map(d => {
    const matchedReports = reports.filter(r => {
      const rDist = (r.district || '').toLowerCase();
      const rLoc = (r.location || '').toLowerCase();
      return rDist === d.id || rDist === d.name.toLowerCase() || rLoc.includes(d.name.toLowerCase()) || rLoc.includes('vushtrri');
    });

    const issuesCount = reports.length > 0 ? matchedReports.length : d.issues;

    let intensity = 'Low';
    let badgeClass = 'low';
    if (issuesCount >= 10) {
      intensity = 'High';
      badgeClass = 'high';
    } else if (issuesCount >= 5) {
      intensity = 'Medium';
      badgeClass = 'medium';
    } else {
      intensity = 'Low';
      badgeClass = 'low';
    }

    let bgColor = d.bgColor;
    if (intensity === 'High') {
      bgColor = 'linear-gradient(135deg, #fca5a5 0%, #fdba74 100%)';
    } else if (intensity === 'Medium') {
      bgColor = 'linear-gradient(135deg, #fde68a 0%, #fef08a 100%)';
    } else {
      bgColor = 'linear-gradient(135deg, #fef08a 0%, #d9f99d 100%)';
    }

    return {
      ...d,
      issues: issuesCount,
      intensity,
      badgeClass,
      bgColor
    };
  });

  const getBadgeStyle = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'high':
      case 'admin':
        return { backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' };
      case 'medium':
      case 'officer':
        return { backgroundColor: '#f3e8ff', color: '#8b5cf6', border: '1px solid #d8b4fe' };
      case 'low':
      case 'citizen':
      case 'active':
        return { backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  const defaultUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'citizen', status: 'active', joined: '9/15/2024', reportsCount: 5 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'citizen', status: 'active', joined: '10/20/2024', reportsCount: 3 },
    { id: '3', name: 'Officer Brown', email: 'brown@city.gov', role: 'officer', status: 'active', joined: '7/10/2024', reportsCount: 0 },
    { id: '4', name: 'Officer Smith', email: 'smith@city.gov', role: 'officer', status: 'active', joined: '8/5/2024', reportsCount: 0 },
    { id: '5', name: 'Admin User', email: 'admin@city.gov', role: 'admin', status: 'active', joined: '1/1/2024', reportsCount: 0 }
  ];

  const displayUsers = users.length > 0 ? users : defaultUsers;

  const filteredUsers = displayUsers.filter(u => 
    (u.name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const getUserReportCount = (u) => {
    if (u.reportsCount !== undefined) return u.reportsCount;
    return reports.filter(r => r.userEmail === u.email || r.author === u.name || r.createdBy === u.email).length;
  };

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
            SmartCity Vushtrri
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
                Vushtrri Admin Dashboard
              </h1>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                Monitor and manage civic reports across Vushtrri neighborhoods
              </p>
            </div>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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

              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ef4444' }}>📈</span> High Priority Issues in Vushtrri
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
            <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Manage Vushtrri Reports & Issues</h1>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr', 
                gridTemplateRows: 'auto auto', 
                gap: '20px' 
              }}>
                <div style={{
                  background: districts[0].bgColor,
                  borderRadius: '24px',
                  padding: '60px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  gridRow: '1 / span 2'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <span style={{ fontSize: '20px' }}>🎯</span>
                  </div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', color: '#1e293b', fontWeight: 700 }}>{districts[0].name}</h2>
                  <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.9rem' }}>{districts[0].subtext}</p>
                  <span style={{
                    backgroundColor: districts[0].intensity === 'High' ? '#fee2e2' : districts[0].intensity === 'Medium' ? '#fef3c7' : '#dcfce7',
                    color: districts[0].intensity === 'High' ? '#ef4444' : districts[0].intensity === 'Medium' ? '#d97706' : '#16a34a',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    {districts[0].issues} issues
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  <div style={{
                    background: districts[1].bgColor,
                    borderRadius: '20px',
                    padding: '30px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>🎯</div>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '1.1rem', color: '#1e293b' }}>{districts[1].name}</h3>
                    <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '0.8rem' }}>{districts[1].subtext}</p>
                    <span style={{ backgroundColor: districts[1].intensity === 'High' ? '#fee2e2' : districts[1].intensity === 'Medium' ? '#fef3c7' : '#dcfce7', color: districts[1].intensity === 'High' ? '#ef4444' : districts[1].intensity === 'Medium' ? '#d97706' : '#16a34a', padding: '2px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {districts[1].issues} Issues
                    </span>
                  </div>

                  <div style={{
                    background: districts[2].bgColor,
                    borderRadius: '20px',
                    padding: '30px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>🎯</div>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '1.1rem', color: '#1e293b' }}>{districts[2].name}</h3>
                    <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '0.8rem' }}>{districts[2].subtext}</p>
                    <span style={{ backgroundColor: districts[2].intensity === 'High' ? '#fee2e2' : districts[2].intensity === 'Medium' ? '#fef3c7' : '#dcfce7', color: districts[2].intensity === 'High' ? '#ef4444' : districts[2].intensity === 'Medium' ? '#d97706' : '#16a34a', padding: '2px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {districts[2].issues} Issues
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{
                  background: districts[3].bgColor,
                  borderRadius: '20px',
                  padding: '30px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>🎯</div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '1.1rem', color: '#1e293b' }}>{districts[3].name}</h3>
                  <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '0.8rem' }}>{districts[3].subtext}</p>
                  <span style={{ backgroundColor: districts[3].intensity === 'High' ? '#fee2e2' : districts[3].intensity === 'Medium' ? '#fef3c7' : '#dcfce7', color: districts[3].intensity === 'High' ? '#ef4444' : districts[3].intensity === 'Medium' ? '#d97706' : '#16a34a', padding: '2px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {districts[3].issues} Issues
                  </span>
                </div>

                <div style={{
                  background: districts[4].bgColor,
                  borderRadius: '20px',
                  padding: '30px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>🎯</div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: '1.1rem', color: '#1e293b' }}>{districts[4].name}</h3>
                  <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '0.8rem' }}>{districts[4].subtext}</p>
                  <span style={{ backgroundColor: districts[4].intensity === 'High' ? '#fee2e2' : districts[4].intensity === 'Medium' ? '#fef3c7' : '#dcfce7', color: districts[4].intensity === 'High' ? '#ef4444' : districts[4].intensity === 'Medium' ? '#d97706' : '#16a34a', padding: '2px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {districts[4].issues} Issues
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'Users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              {/* Fixed Header Layout without wrapping/overflow issues */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                gap: '16px',
                flexWrap: 'nowrap'
              }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    User Management
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Manage users, roles, and permissions across Vushtrri
                  </p>
                </div>

                <div style={{ position: 'relative', width: '280px', minWidth: '220px', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                      <th style={{ padding: '12px 16px' }}>Name</th>
                      <th style={{ padding: '12px 16px' }}>Email</th>
                      <th style={{ padding: '12px 16px' }}>Role</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Reports</th>
                      <th style={{ padding: '12px 16px' }}>Joined</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => {
                        const reportCount = getUserReportCount(u);
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                            <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{u.name || 'Anonymous User'}</td>
                            <td style={{ padding: '16px', color: '#64748b' }}>{u.email}</td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'lowercase',
                                ...getBadgeStyle(u.role || 'citizen')
                              }}>
                                {u.role || 'citizen'}
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'lowercase',
                                ...getBadgeStyle(u.status || 'active')
                              }}>
                                {u.status || 'active'}
                              </span>
                            </td>
                            <td style={{ padding: '16px', fontWeight: 600 }}>{reportCount}</td>
                            <td style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>{u.joined || 'N/A'}</td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button title="Permissions" style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>🛡️</button>
                                <button title="Deactivate/Delete" style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>👤❌</button>
                                <button title="Reset Password" style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>🔑</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                          No users found matching "{userSearchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}