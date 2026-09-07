import React, { useState } from 'react';
import AuthPage from './pages/AuthPage';
import CitizenDashboard from './pages/CitizenDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');

  const handleDemoAccess = (role) => {
    if (role === 'Citizen') {
      setCurrentPage('citizen-dashboard');
    } else {
      console.log(`Demo access for ${role} is not configured yet.`);
    }
  };

  const handleLogout = () => {
    setCurrentPage('auth');
  };

  return (
    <div className="App-container">
      {currentPage === 'auth' ? (
        <AuthPage onDemoAccess={handleDemoAccess} />
      ) : (
        <CitizenDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;