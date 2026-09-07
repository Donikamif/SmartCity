import React from 'react';

export default function AuthTemplate({ hero, card }) {
  return (
    <div className="App">
      <div className="auth-layout">
        <div className="hero-section">
          {hero}
        </div>
        <div className="card-section">
          {card}
        </div>
      </div>
    </div>
  );
}