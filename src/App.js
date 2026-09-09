import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import LoginCard from './components/organisms/LoginCard';
import CitizenDashboard from './pages/CitizenDashboard'; // Adjust path if needed
import AdminDashboard from './pages/AdminDashboard';   // Adjust path if needed

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user's assigned role from Firestore 'users' collection
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserRole(data.role || 'Citizen');
          } else {
            // Default fallback if no doc exists yet
            setUserRole('Citizen');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('Citizen');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#64748b'
      }}>
        Loading SmartCity...
      </div>
    );
  }

  // 1. Unauthenticated View
  if (!user) {
    return <LoginCard onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // 2. Admin Dashboard View
  if (userRole === 'Admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // 3. Citizen / Officer View (Default)
  return <CitizenDashboard user={user} onLogout={handleLogout} role={userRole} />;
}