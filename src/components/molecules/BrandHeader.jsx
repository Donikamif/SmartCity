import React from 'react';
import BrandLogo from '../atoms/BrandLogo';

export default function BrandHeader({ title, tagline }) {
  return (
    <div className="brand-header">
      <BrandLogo />
      <div>
        <h1 className="brand-title">{title}</h1>
        <span className="brand-tagline">{tagline}</span>
      </div>
    </div>
  );
}