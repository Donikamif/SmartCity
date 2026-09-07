import React from 'react';
import Button from '../atoms/Button';

export default function ToggleGroup({ isLogin, onToggle }) {
  return (
    <div className="toggle-container">
      <Button
        type="button"
        className={`toggle-btn ${isLogin ? 'active' : ''}`}
        onClick={() => onToggle(true)}
      >
        Login
      </Button>
      <Button
        type="button"
        className={`toggle-btn ${!isLogin ? 'active' : ''}`}
        onClick={() => onToggle(false)}
      >
        Sign Up
      </Button>
    </div>
  );
}