import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginCard({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // 1. Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Auth Display Name
        await updateProfile(user, {
          displayName: fullName
        });

        // 3. Save user role and info into Firestore 'users' collection
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          role: role, // 'Admin', 'Citizen', or 'Officer'
          createdAt: serverTimestamp()
        });

        if (onLoginSuccess) onLoginSuccess(user);
      } else {
        // Login existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (onLoginSuccess) onLoginSuccess(userCredential.user);
      }
    } catch (err) {
      console.error("Authentication Error:", err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#009688',
            color: '#ffffff',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            marginBottom: '12px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>SmartCity</h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            {isSignup ? 'Create an account to report city issues' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {isSignup && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Donika Miftari"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {isSignup && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Citizen">Citizen</option>
                <option value="Admin">Admin</option>
                <option value="Officer">Officer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#009688',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#64748b' }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#009688',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}