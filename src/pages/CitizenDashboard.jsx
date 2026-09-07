import React, { useState } from 'react';
import ReportHeader from '../components/molecules/ReportHeader';
import ReportFormSection from '../components/organisms/ReportFormSection';
import ReportsGrid from '../components/organisms/ReportsGrid';
import { initialReports } from '../data/mockReports';
import './CitizenDashboard.css';

export default function CitizenDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState(initialReports);

  const handleAddReport = (newReport) => {
    setReports([newReport, ...reports]);
  };

  return (
    <div className="citizen-dashboard-container">
      <ReportHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userName="Demo Citizen" 
        userRole="Citizen" 
        onLogout={onLogout} 
      />

      <main className="dashboard-content">
        <ReportFormSection onAddReport={handleAddReport} />
        <ReportsGrid reports={reports} />
      </main>
    </div>
  );
}