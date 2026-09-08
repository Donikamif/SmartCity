import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './LoginCard.css';

export default function LoginCard({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Attach full name profile
        await updateProfile(user, { displayName: fullName });

        // 3. Optional: Store user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          role: 'Citizen',
          municipality: 'Vushtrri',
          createdAt: new Date().toISOString()
        });

      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      }

      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      console.error("Auth Error:", err.message);
      setErrorMsg(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>{isSignUp ? 'Create Account' : 'Sign In to SmartCity'}</h2>
      <p className="auth-subtitle">Civic Reporting Platform for Vushtrri</p>

      {errorMsg && <div className="auth-error-badge">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {isSignUp && (
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Donika Miftari" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      <div className="auth-toggle">
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
          <button 
            type="button" 
            className="toggle-btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}