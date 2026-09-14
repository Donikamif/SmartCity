import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import LoginCard from './components/organisms/LoginCard';
import CitizenDashboard from './pages/CitizenDashboard'; 
import AdminDashboard from './pages/AdminDashboard';   
import OfficerDashboard from './pages/OfficerDashboard'; 


export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
 
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
     
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserRole(data.role || 'Citizen');
          } else {
       
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

  if (!user) {
    return <LoginCard onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  if (userRole === 'Admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }
  if (userRole === 'Officer') {
    return <OfficerDashboard user={user} onLogout={handleLogout} />;
  }

  
  return <CitizenDashboard user={user} onLogout={handleLogout} role={userRole} />;
}