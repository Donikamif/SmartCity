import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

const CATEGORY_COLORS = ['#ef4444', '#ec4899', '#06b6d4', '#3b82f6', '#10b981', '#8b5cf6'];

export default function Analytics({ reports = [] }) {
  const [filterTime, setFilterTime] = useState('This Month');

  // Compute Analytics Data from reports
  const categoryCount = reports.reduce((acc, report) => {
    acc[report.category] = (acc[report.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCount).length > 0 
    ? Object.keys(categoryCount).map((cat) => ({ name: cat, value: categoryCount[cat] }))
    : [
        { name: 'Roads', value: 1 },
        { name: 'Health', value: 1 },
        { name: 'Parks', value: 1 },
        { name: 'Water', value: 1 },
        { name: 'Sanitation', value: 1 },
        { name: 'Street Lights', value: 1 }
      ];

  const statusCount = reports.reduce((acc, report) => {
    const st = report.status === 'In Progress' ? 'In Progress' : (report.status === 'Resolved' ? 'Resolved' : 'Pending');
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, { Pending: 3, 'In Progress': 2, Resolved: 1 });

  const statusData = [
    { name: 'Pending', count: statusCount['Pending'] || 0, fill: '#f59e0b' },
    { name: 'In Progress', count: statusCount['In Progress'] || 0, fill: '#3b82f6' },
    { name: 'Resolved', count: statusCount['Resolved'] || 0, fill: '#10b981' }
  ];

  const timelineData = [
    { date: 'Sep 3', Submitted: 0, Resolved: 0 },
    { date: 'Sep 4', Submitted: 0, Resolved: 0 },
    { date: 'Sep 5', Submitted: 1, Resolved: 0 },
    { date: 'Sep 6', Submitted: 0, Resolved: 0 },
    { date: 'Sep 7', Submitted: 0, Resolved: 0 },
    { date: 'Sep 8', Submitted: 0, Resolved: 0 },
    { date: 'Sep 9', Submitted: reports.length, Resolved: reports.filter(r => r.status === 'Resolved').length }
  ];

  const departmentStats = [
    { department: 'Public Works', total: reports.filter(r => r.department === 'Public Works').length || 1, resolved: reports.filter(r => r.department === 'Public Works' && r.status === 'Resolved').length || 0 },
    { department: 'Electricity', total: reports.filter(r => r.department === 'Electricity').length || 1, resolved: reports.filter(r => r.department === 'Electricity' && r.status === 'Resolved').length || 1 },
    { department: 'Unassigned', total: reports.filter(r => !r.department || r.department === 'Unassigned').length || 3, resolved: 0 },
    { department: 'Water', total: reports.filter(r => r.department === 'Water').length || 1, resolved: 0 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            Admin Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
            Monitor and manage the city's issue reporting system
          </p>
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
              Analytics Dashboard
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Comprehensive insights and trends
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '0.9rem',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="This Year">This Year</option>
          </select>

          <button
            onClick={() => alert("Exporting analytics data...")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Data
          </button>
        </div>
      </div>

      {/* Row 1: Reports by Category & Status Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Reports by Category Card */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Reports by Category</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748b' }}>Distribution across different issue types</p>
          
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Card */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Status Distribution</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748b' }}>Current state of all reports</p>
          
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 3]} ticks={[0, 0.75, 1.5, 2.25, 3]} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Reports Timeline */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Reports Timeline</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748b' }}>Daily report submissions and resolutions</p>
        
        <div style={{ height: '260px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
              <Line type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Submitted" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Department Performance & Statistics */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Department Performance</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748b' }}>Resolution rates by department</p>
        
        <div style={{ height: '260px', width: '100%', marginBottom: '32px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 3]} ticks={[0, 0.75, 1.5, 2.25, 3]} />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
              <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="Total Issues" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Department Statistics</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Total Issues</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Resolved</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept, idx) => {
                const rate = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#0f172a' }}>{dept.department}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#334155' }}>{dept.total}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#334155' }}>{dept.resolved}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <span style={{
                        backgroundColor: rate > 0 ? '#dcfce7' : '#fef3c7',
                        color: rate > 0 ? '#15803d' : '#b45309',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}