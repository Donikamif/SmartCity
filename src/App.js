import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginCard from './components/organisms/LoginCard';
import CitizenDashboard from './pages/CitizenDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persistent auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div className="loading-screen">Loading SmartCity Vushtrri...</div>;
  }

  return (
    <div className="app-container">
      {currentUser ? (
        <CitizenDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <div className="auth-page-wrapper">
          <LoginCard />
        </div>
      )}
    </div>
  );
}