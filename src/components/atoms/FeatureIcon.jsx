import React from 'react';

export default function FeatureIcon({ variant, children }) {
  return (
    <div className={`feature-icon ${variant}`}>
      {children}
    </div>
  );
}