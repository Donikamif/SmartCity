import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';

export default function OfficerDashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');

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
      
      if (fetchedReports.length > 0 && !selectedReport) {
        setSelectedReport(fetchedReports[0]);
      } else if (selectedReport) {
        const updatedCurrent = fetchedReports.find(r => r.id === selectedReport.id);
        if (updatedCurrent) setSelectedReport(updatedCurrent);
      }
    }, (error) => {
      console.error("Error fetching reports:", error);
    });

    return () => unsubscribeReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesCategory = categoryFilter === 'All Categories' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Status' || r.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;

  const getBadgeStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'resolved':
        return { backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' };
      case 'in progress':
        return { backgroundColor: '#dbeafe', color: '#2563eb', border: '1px solid #93c5fd' };
      case 'pending':
        return { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  const getCategoryBadgeStyle = (category) => {
    return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? timestamp : date.toLocaleDateString();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        height: '72px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '1.35rem', color: '#0f172a' }}>
          <span style={{ backgroundColor: '#0d9488', color: '#fff', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </span>
          SmartCity
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#64748b' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {user?.displayName || user?.email?.split('@')[0] || 'ddonikamiftari'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Officer</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
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

      <main style={{ padding: '32px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
            Officer Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>
            Manage and resolve reported issues
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: '24px', alignItems: 'start' }}>
          
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Assigned Issues ({reports.length})
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, ...getBadgeStyle('Pending') }}>
                Pending: {pendingCount}
              </span>
              <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, ...getBadgeStyle('In Progress') }}>
                In Progress: {inProgressCount}
              </span>
              <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, ...getBadgeStyle('Resolved') }}>
                Resolved: {resolvedCount}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#fff', color: '#334155', cursor: 'pointer' }}
              >
                <option value="All Categories">All Categories</option>
                <option value="Roads">Roads</option>
                <option value="Street Lights">Street Lights</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Water">Water</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#fff', color: '#334155', cursor: 'pointer' }}
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '620px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;
                  return (
                    <div 
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#f0fdfa' : '#fafafa',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, ...getBadgeStyle(report.status) }}>
                          {report.status}
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, ...getCategoryBadgeStyle(report.category) }}>
                          {report.category}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', lineHeight: '1.4' }}>
                        {report.description || report.title || 'Untitled Report'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📍 {report.location || 'Vushtrri'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>📅 {formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  No reports found matching your filters.
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            padding: '28px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {selectedReport ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Issue Details</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>ID: {selectedReport.id.slice(0, 8)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, ...getBadgeStyle(selectedReport.status) }}>
                      {selectedReport.status}
                    </span>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, ...getCategoryBadgeStyle(selectedReport.category) }}>
                      {selectedReport.category}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Update Status:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Pending', 'In Progress', 'Resolved'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedReport.id, st)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: selectedReport.status === st ? '1px solid #0d9488' : '1px solid #cbd5e1',
                          backgroundColor: selectedReport.status === st ? '#f0fdfa' : '#ffffff',
                          color: selectedReport.status === st ? '#0d9488' : '#334155',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Description</div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5' }}>
                    {selectedReport.description || selectedReport.title || 'No description provided.'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Photo</div>
                  <div style={{ 
                    height: '240px', 
                    backgroundColor: '#f8fafc', 
                    border: '2px dashed #cbd5e1', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {selectedReport.imageUrl ? (
                      <img src={selectedReport.imageUrl} alt="Report attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <span style={{ fontSize: '0.85rem' }}>No photo attached</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📍 <span>Location: <strong>{selectedReport.location || 'Vushtrri'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📅 <span>Reported On: <strong>{formatDate(selectedReport.createdAt)}</strong></span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                Select an issue from the left list to view details.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}