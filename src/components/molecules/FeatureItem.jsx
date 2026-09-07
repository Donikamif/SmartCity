import React from 'react';
import FeatureIcon from '../atoms/FeatureIcon';

export default function FeatureItem({ icon, title, description, variant }) {
  return (
    <div className="feature-item">
      <FeatureIcon variant={variant}>
        {icon}
      </FeatureIcon>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
}