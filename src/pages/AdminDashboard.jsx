import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import Analytics from '../components/Analytics';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Overview');
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

  // Dynamic calculations from real citizen reports
  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
  const completionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  const getCategoryColor = (name) => {
    switch ((name || '').toLowerCase()) {
      case 'roads': return '#ef4444';
      case 'street lights': return '#8b5cf6';
      case 'sanitation': return '#10b981';
      case 'water': return '#3b82f6';
      case 'parks': return '#06b6d4';
      default: return '#0d9488';
    }
  };

  const categoryCounts = reports.reduce((acc, report) => {
    const cat = report.category || 'Roads';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const dynamicCategories = Object.keys(categoryCounts).length > 0
    ? Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count,
        percentage: totalReports > 0 ? Math.round((count / totalReports) * 100) : 0,
        color: getCategoryColor(name)
      }))
    : [
        { name: 'Roads', count: 0, percentage: 0, color: '#ef4444' },
        { name: 'Street Lights', count: 0, percentage: 0, color: '#8b5cf6' },
        { name: 'Sanitation', count: 0, percentage: 0, color: '#10b981' },
        { name: 'Water', count: 0, percentage: 0, color: '#3b82f6' },
        { name: 'Parks', count: 0, percentage: 0, color: '#06b6d4' }
      ];

  const highPriorityReports = [...reports]
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, 3);

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
            {['Overview', 'Analytics', 'Issues', 'Users'].map((tab) => (
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
                Monitor and manage live civic reports submitted by citizens across Vushtrri
              </p>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  Total Reports <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>!</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '12px 0 4px 0' }}>{totalReports}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Live database count</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  Pending <span style={{ color: '#d97706' }}>⏱️</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d97706', margin: '12px 0 4px 0' }}>{pendingCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{totalReports > 0 ? Math.round((pendingCount / totalReports) * 100) : 0}% of total</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  In Progress <span style={{ color: '#2563eb' }}>📈</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb', margin: '12px 0 4px 0' }}>{inProgressCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{totalReports > 0 ? Math.round((inProgressCount / totalReports) * 100) : 0}% of total</div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                  Resolved <span style={{ color: '#16a34a' }}>✅</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a', margin: '12px 0 4px 0' }}>{resolvedCount}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{completionRate}% completion rate</div>
              </div>
            </div>

            {/* Categories & High Priority Citizen Reports */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Top Issue Categories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {dynamicCategories.map((cat, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                          {cat.name}
                        </span>
                        <span style={{ color: '#64748b' }}>{cat.count} ({cat.percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${cat.percentage}%`, height: '100%', backgroundColor: cat.color, borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ef4444' }}>📈</span> Top Citizen Reports
                </h3>
                {highPriorityReports.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {highPriorityReports.map((item) => (
                      <div key={item.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            📈 {item.upvotes || 0} votes
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155', lineHeight: 1.4 }}>
                          {item.title || item.description || 'Citizen civic report'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📍 {item.location || 'Vushtrri'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    No citizen reports submitted yet.
                  </div>
                )}
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
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{report.category} - {report.location || 'Vushtrri'}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{report.description || report.title}</div>
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
              ))
            ) : (
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                No reports found in the database.
              </div>
            )}
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
                              <button
                                onClick={() => {
                                  alert(`Manage user: ${u.name || u.email}`);
                                }}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#ffffff',
                                  color: '#334155',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Edit Role
                              </button>
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